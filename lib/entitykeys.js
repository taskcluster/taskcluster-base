"use strict";

var util            = require('util');
var assert          = require('assert');
var _               = require('lodash');
var debug           = require('debug')('base:entity:keys');
var crypto          = require('crypto');

/**
 * Encode string-key, to escape characters for Azure Table Storage and replace
 * empty strings with a single '!', so that empty strings can be allowed.
 */
var encodeStringKey = function(str) {
  // Check for empty string
  if (str === "") {
    return "!";
  }
  // 1. URL encode
  // 2. URL encode all exclamation marks (replace ! with %21)
  // 3. URL encode all tilde (replace ~ with %7e)
  //    This ensures that when using ~ as separator in CompositeKey we can
  //    do prefix matching
  // 4. Replace % with exclamation marks for Azure compatibility
  return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/~/g, '%7e')
            .replace(/%/g, '!');
};

/** Decode string-key (opposite of encodeStringKey) */
var decodeStringKey = function(key) {
  // Check for empty string
  if (key === "!") {
    return "";
  }
  // 1. Replace exclamation marks with % to get URL encoded string
  // 2. URL decode (this handle step 1 and 2 from encoding process)
  return decodeURIComponent(key.replace(/!/g, '%'));
};

/******************** String Key ********************/

/** Construct a StringKey */
var StringKey = function(mapping, key) {
  // Set key
  this.key = key;

  // Set key type
  assert(mapping[this.key], "key '" + key + "' is not defined in mapping");
  this.type = mapping[this.key];

  // Set covers
  this.covers = [key];
};

/** Construct exact key if possible */
StringKey.prototype.exact = function(properties) {
  // Get value
  var value = properties[this.key];
  // Check that value was given
  assert(value !== undefined, "Unable to create key from properties");
  // Return exact key
  return encodeStringKey(this.type.string(value));
};

/** Create StringKey builder */
exports.StringKey = function(key) {
  return function(mapping) {
    return new StringKey(mapping, key);
  };
};

/******************** Constant Key ********************/

/** Construct a ConstantKey */
var ConstantKey = function(constant) {
  assert(typeof(constant) === 'string', "ConstantKey takes a string!");

  // Set constant
  this.constant = constant;
  this.encodedConstant = encodeStringKey(constant);

  // Set covers
  this.covers = [];
};

ConstantKey.prototype.exact = function(properties) {
  return this.encodedConstant;
};

exports.ConstantKey = function(constant) {
  assert(typeof(constant) === 'string', "ConstantKey takes a string!");
  return function(mapping) {
    return new ConstantKey(constant);
  };
};


/******************** Composite Key ********************/

// Separator for use in Composite keys (don't change this)
// Note, that tilde is the last character, we can exploit this when we decide to
// implement prefix matching for rowKeys.
var COMPOSITE_SEPARATOR = '~';

/** Construct a CompositeKey */
var CompositeKey = function(mapping, keys) {
  assert(keys instanceof Array, "keys must be an array");
  assert(keys.length > 0, "CompositeKey needs at least one key")

  // Set keys
  this.keys = keys;

  // Set key types
  this.types = [];
  for(var i = 0; i < keys.length; i++) {
    assert(mapping[keys[i]], "key '" + keys[i] + "' is not defined in mapping");
    this.types[i] = mapping[keys[i]];
  }

  // Set covers
  this.covers = keys;
};

CompositeKey.prototype.exact = function(properties) {
  // Map each key to it's string encoded value
  return this.keys.map(function(key, index) {
    // Get value from key
    var value = properties[key];
    if (value === undefined) {
      throw new Error("Unable to render CompositeKey from properties, " +
                      "missing: '" + key + "'");
    }

    // Encode as string
    return encodeStringKey(this.types[index].string(value));
  }, this).join(COMPOSITE_SEPARATOR); // Join with separator
};

exports.CompositeKey = function() {
  var keys = Array.prototype.slice.call(arguments);
  keys.forEach(function(key) {
    assert(typeof(key) === 'string', "CompositeKey takes strings as arguments");
  });
  return function(mapping) {
    return new CompositeKey(mapping, keys);
  };
};

/******************** Hash Key ********************/

// Check that crypto has support for sha512
assert(crypto.getHashes().indexOf('sha512') !== -1,
       "crypto doesn't support sha512, please upgrade OpenSSL");

// Separator used to separate entries in hash key (don't change this)
var HASH_KEY_SEPARATOR = ':';

/** Construct a HashKey */
var HashKey = function(mapping, keys) {
  assert(keys instanceof Array, "keys must be an array");
  assert(keys.length > 0, "HashKey needs at least one key")

  // Set keys
  this.keys = keys;

  // Set key types
  this.types = [];
  for(var i = 0; i < keys.length; i++) {
    assert(mapping[keys[i]], "key '" + keys[i] + "' is not defined in mapping");
    this.types[i] = mapping[keys[i]];
  }

  // Set covers
  this.covers = keys;
};

HashKey.prototype.exact = function(properties) {
  var hash =  crypto.createHash('sha512');
  var n = this.keys.length;
  for (var i = 0; i < n; i++) {
    var key = this.keys[i];

    // Get value from key
    var value = properties[key];
    if (value === undefined) {
      throw new Error("Unable to render HashKey from properties, " +
                      "missing: '" + key + "'");
    }

    // Find hash value and update the hashsum
    hash.update(this.types[i].hash(value), 'utf8');

    // Insert separator, if this isn't the last key
    if (i + 1 < n) {
      hash.update(HASH_KEY_SEPARATOR, 'utf8');
    }
  }

  return hash.digest('hex');
};

exports.HashKey = function() {
  var keys = Array.prototype.slice.call(arguments);
  keys.forEach(function(key) {
    assert(typeof(key) === 'string', "HashKey takes strings as arguments");
  });
  return function(mapping) {
    return new HashKey(mapping, keys);
  };
};


/******************** Key ********************/

var Item = base.Entity.configure({
  version:          1,
  partitionKey:     [{contant: 'my-constant'}],
  partitionKey:     base.Entity.keys.Key([
                      {constant:  'my-constant'},
                      {property:  'id'},
                      {property:  'data'},
                      {hash: ['text1']},
                      {hash: ['text1', 'text2']}
                    ]),
  rowKey:           Key('id', 'data', {hash: ['text1', 'text2']}),
  partitionKey:     base.Entity.keys.CompositeKey('id', 'data'),
  rowKey:           base.Entity.keys.CompositeKey('text1', 'text2'),
  properties: {
    text1:          base.Entity.types.String,
    text2:          base.Entity.types.String,
    id:             base.Entity.types.SlugId,
    data:           base.Entity.types.Number
  }
})

/** Key object serializing */
var Key = function(definition, mapping) {
  // Check that the definition is an array
  if (!(definition instanceof Array)) {
    var err = new Error("Invalid key definition: Definition must be an array");
    err.definition = definition;
    throw err;
  }
  // Validate each entry, this isn't concise in any way, it's meant to produce
  // good and easily traceable error messages
  definition.forEach(function(entry) {
    // Check that each entry is an object
    if (typeof(entry) !== 'object') {
      var err = new Error("Invalid key entry: Must be an object");
      err.definition = definition;
      err.entry = entry;
      throw err;
    }
    // Check that the entry only has one property
    var keys = _.keys(entry);
    if (keys.length !== 1) {
      var err = new Error("Invalid key entry: Object must carry a property");
      err.definition = definition;
      err.entry = entry;
      throw err;
    }
    // Check different kind of entries
    if (keys[0] === 'constant') {
      if (typeof(entry.constant) !== 'string' || entry.constant.length === 0) {
        var err = new Error(
          "Invalid key entry: Value in {constant: value}, must be a " +
          "non-empty string"
        );
        err.definition = definition;
        err.entry = entry;
        throw err;
      }
    } else if (keys[0] === 'property') {
      // Check that the property reference is a string
      if (typeof(entry.property) !== 'string' || entry.property.length === 0) {
        var err = new Error(
          "Invalid key entry: Value in {property: value}, must be a " +
          "non-empty string, referencing a property"
        );
        err.definition = definition;
        err.entry = entry;
        throw err;
      }
      var property = mapping[entry.property];
      if (!property || !property.toComparableBuffer) {
        var err = new Error(
          "Invalid key entry: Value in {property: value}, must be a " +
          "referencing a property that is comparable"
        );
        err.definition = definition;
        err.entry = entry;
        err.propertyName = entry.property;
        throw err;
      }
    } else if (keys[0] === 'hash') {
      // Check that the value is an array
      if (!(entry.hash instanceof Array) || entry.hash.length === 0) {
        var err = new Error(
          "Invalid key entry: Value in {hash: value}, must be a " +
          "non-empty array, referencing properties"
        );
        err.definition = definition;
        err.entry = entry;
        throw err;
      }
      // Check that referenced properties are hash-able
      entry.hash.forEach(function(propertyName) {
        var property = mapping[propertyName];
        if (!property || !property.toHashableBuffer) {
          var err = new Error(
            "Invalid hash-key entry: Value in {hash: [value]}, must be a " +
            "referencing a property that is hash-able"
          );
          err.definition = definition;
          err.entry = entry;
          err.propertyName = propertyName;
          throw err;
        }
      });
    } else {
      var err = new Error(
        "Invalid key entry: Object must have property: 'constant', " +
        "'property' or 'hash'"
      );
      err.definition = definition;
      err.entry = entry;
      throw err;
    }
  });

  // TODO: Validate the max-length of the key is possible with mapping carries
  //       information about max data size for each entry

  // Find properties covered by this key
  var covers = [];
  definition.forEach(function(entry) {
    if (entry.property && covers.indexOf(entry.property) === -1) {
      covers.push(entry.property);
    }
    (entry.hash || []).forEach(function(property) {
      if (covers.indexOf(property) === -1) {
        covers.push(property);
      }
    });
  });
  // Store definition, mapping and covers
  this.definition = definition;
  this.mapping    = mapping;
  this.covers     = covers;
};


var KEY_PREFIX          = '~';
var KEY_VALUE_SEPARATOR = '~';
var KEY_HASH_ALGORITHM  = 'sha256';
var KEY_HASH_SEPARATEOR = '\n';

HashKey.prototype.exact = function(properties) {
  var hash = crypto.createHash(KEY_HASH_ALGORITHM);
  var n = this.keys.length;
  for (var i = 0; i < n; i++) {
    var key = this.keys[i];

    // Get value from key
    var value = properties[key];
    if (value === undefined) {
      throw new Error("Unable to render HashKey from properties, " +
                      "missing: '" + key + "'");
    }

    // Find hash value and update the hashsum
    hash.update(this.types[i].hash(value), 'utf8');

    // Insert separator, if this isn't the last key
    if (i + 1 < n) {
      hash.update(HASH_KEY_SEPARATOR, 'utf8');
    }
  }

  return hash.digest('hex');
};


Key.prototype.exact = function(properties) {
  // Validate that we have the properties needed
  this.covers.forEach(function(property) {
    if (properties[property] === undefined) {
      throw new Error("Unable to render exact key without a value for the " +
                      "property: " + property);
    }
  });
  var key = this.definition.map(function(entry) {
    // Return constants as utf8 encoded string
    if (entry.constant) {
      return new Buffer(entry.constant, 'utf8');
    }
    // Return properties as comparable buffers
    if (entry.property) {
      var value = properties[entry.property];
      return this.mapping[entry.property].toComparableBuffer(value);
    }
    // If not constant or property, it must be a hash
    assert(entry.hash instanceof Array, "Only valid entry type left is hash");
    // Create hash algorithm
    var hash = crypto.createHash(KEY_HASH_ALGORITHM);
    var n = entry.hash.length;
    // For each property
    for(var i = 0; i < n; i++) {
      // Find property and value
      var property = entry.hash[i];
      var value = properties[property];
      // Update hash with data
      hash.update(this.mapping[property].toHashableBuffer(value), 'utf8');
      // Insert separator, if this isn't the last key
      if (i + 1 < n) {
        hash.update(KEY_HASH_SEPARATEOR, 'utf8');
      }
    }
    // return hash digest
    return hash.digest('binary');
  }.bind(this)).map(function(data) {
    return d64.encode(data);
  }).join(KEY_SEPARATOR);
  return KEY_PREFIX + key;
};

/** Create new Key objects */
exports.Key = function(definition, mapping) {
  return new Key(definition, mapping);
};