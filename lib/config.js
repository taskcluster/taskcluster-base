"use strict";

var _       = require('lodash');
var yaml    = require('js-yaml');
var fs      = require('fs');
var debug   = require('debug')('base:config');
var assert  = require('assert');

/**
 * Load configuration from files and environment variables.
 *
 * options:
 * ```js
 * {
 *   files: [               // Files to load configuration from
 *     'config.yml',        // Defaults are relative to process.cwd
 *     'user-config.yml'
 *   ]
 *   profile:  undefined,   // Profile to apply
 *   env:      process.env  // Environment variables (mapping string to strings)
 * }
 * ```
 *
 * Configuration Format:
 * ```yaml
 * Options:
 *   hostname:     localhost
 *   port:         8080
 * Profiles:
 *   production:
 *     hostname:   example.com
 *     port:       !env:number PORT
 * ```
 *
 * The following special YAML types can be used to load from environment
 * variables:
 * ```
 * !env        <NAME>  Load string from env var <NAME>
 * !env:string <NAME>  Load string from env var <NAME>
 * !env:number <NAME>  Load number from env var <NAME>
 * !env:flag   <NAME>  Load true if env var <NAME> is defined
 * !env:bool   <NAME>  Load boolean as /true/i or /false/i from env var <NAME>
 * !env:json   <NAME>  Load JSON object from env var <NAME>
 * !env:list   <NAME>  Load list of space separated strings from env var <NAME>
 * ```
 *
 * If the environment variable in question isn't defined, the value will be
 * `undefined`, so it can fall-back to defaults from previous config file.
 */
var config = function(options) {
  options = _.defaults({}, options, {
    files: [
      'config.yml',
      'user-config.yml'
    ],
    profile:  undefined,
    env:      process.env
  });
  assert(options.files instanceof Array, "Expected an array of files");
  assert(typeof(options.env) === 'object', "Expected env to be an object");

  // Create a YAML type that loads from environment variable
  var createType = function(name, typeName, deserialize) {
    // Create new YAML type
    return new yaml.Type(name, {
      // Takes a string as input
      kind: 'scalar',
      // Accepts any string on the form [A-Z0-9_]+
      resolve: function (data) {
        return typeof(data) === 'string' && /^[A-Z0-9_]+$/.test(data);
      },
      // Deserialize the data, in the case we read the environment variable
      construct: function (data) {
        var value = options.env[data];
        try {
          return deserialize(value);
        } catch (err) {
          // Print a warning, if the environment variable is present
          if (value !== undefined) {
            console.log("base.config: Warning failed to load %s from " +
                        "environment variable '%s'", typeName, data);
          }
          return undefined;
        }
      }
    });
  };

  // Construct YAML schema
  var YAML_SCHEMA = yaml.Schema.create(yaml.JSON_SCHEMA, [
    createType('!env', 'string', function(val) {
      assert(typeof(val) === 'string');
      return val;
    }),
    createType('!env:string', 'string', function(val) {
      assert(typeof(val) === 'string');
      return val;
    }),
    createType('!env:number', 'string', function(val) {
      assert(typeof(val) === 'string');
      return parseFloat(val);
    }),
    createType('!env:flag', 'string', function(val) {
      return typeof(val) === 'string';
    }),
    createType('!env:bool', 'string', function(val) {
      assert(typeof(val) === 'string');
      if (/^true$/i.test(val)) {
        return true;
      }
      if (/^false$/i.test(val)) {
        return false;
      }
      return undefined;
    }),
    createType('!env:json', 'string', function(val) {
      assert(typeof(val) === 'string');
      return JSON.parse(val);
    }),
    createType('!env:list', 'string', function(val) {
      assert(typeof(val) === 'string');
      return val.split(' ').filter(function(entry) {
        return entry !== '';
      });
    })
  ]);

  // Load files and parse YAML files
  var cfgs = [];
  options.files.forEach(function(file) {
    var data;

    // Load data from file
    try {
      data = fs.readFileSync(file, {encoding: 'utf-8'});
    } catch (err) {
      // Don't print error, if the file is just missing
      if (err.code !== 'ENOENT') {
        debug("Failed to load: %s, err: %s", file, err, err.stack);
      } else {
        debug("Config file missing: %s", file);
      }
      return;
    }

    // Load YAML from data
    try {
      data = yaml.safeLoad(data, {
        filename:     file,
        schema:       YAML_SCHEMA
      });
    } catch (err) {
      debug("Failed to parse YAML from %s, err: %s",
            file, err.toString(), err.stack);
      throw new Error("Can't parse YAML from: " + file + " " + err.toString());
    }
    // Add options to list of configurations if present
    if (data.Options) {
      assert(typeof(data.Options) === 'object', "'Options' must be an object");
      cfgs.unshift(data.Options);
    }

    // Add profile to list of configurations, if it is given
    if (data.Profiles && options.profile && data.Profiles[options.profile]) {
      var profile = data.Profiles[options.profile];
      assert(typeof(profile) === 'object', "profile must be an object");
      cfgs.unshift(profile);
    }
  });


  // Combine all the configuration keys
  var cfg = _.defaultsDeep.apply(_, cfgs);

  return cfg;
};

// Export config
module.exports = config;
