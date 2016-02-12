var base = require('./');
var _ = require('lodash');
var assert = require('assert');
_.forIn(base, function(module, name) {
  console.log('Loading: ' + name);
   assert(module, 'Failed to load: ' + name);
});
console.log('WOOHOO! All of the modules import correctly.');
console.log('This is the only test we need for this package.');
