var base = require('./');
var _ = require('lodash');
var assert = require('assert');
var pack = require('./package.json');
var exec = require('child_process');

// First we test to see if all of the packages are
// importable safely.
_.forIn(base, function(module, name) {
  console.log('Loading: ' + name);
   assert(module, 'Failed to load: ' + name);
});
console.log('WOOHOO! All of the modules import correctly.');


// Now we check to see if a release is tagged correctly
// (If there is a releast at this revision at all)
var tag = exec.execSync('git tag -l --contains HEAD').toString().trim();
if (tag === '') {
  console.log('No git tag, no need to check release tag!');
} else {
  assert.equal('v' + pack.version, tag);
  console.log('WOOHOO! The git tag matches the package.json version.');
}

console.log('All tests passed.');
