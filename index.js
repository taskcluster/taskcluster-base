"use strict";
var util = require('util');

var awsSdkPromise;
try {
  awsSdkPromise = require.resolve('aws-sdk-promise');
  awsSdkPromise = [
    'Your environment can resolve the \'aws-sdk-promise\' ',
    'library.  This is a bad thing because it means that ',
    'code in your environment import and be broken by it.  ',
    'What happens is that it overwrites the global \'aws-sdk\' ',
    '.promise() method with its own version.  Now that the ',
    'upstream library has a promise implementation, use it.  ',
    'Do note that you must remove the .data lookup on the ',
    'resolution value of api calls with the upstream library.',
    '',
    '\nFound aws-sdk-promise here: ' + awsSdkPromise,
  ].join('');

  console.log(msg);
} catch (err) { }

if (awsSdkPromise) {
  throw new Error(awsSdkPromise);
}

// Lazy load all submodules, not many production systems need to load
// 'testing' and loading code actually takes time.
var _ = require('lodash');
_.forIn({
  config:         'typed-env-config',
  app:            'taskcluster-lib-app',
  validator:      'taskcluster-lib-validate',
  API:            'taskcluster-lib-api',
  Entity:         'azure-entities',
  loader:         'taskcluster-lib-loader',
  Exchanges:      'pulse-publisher',
  testing:        'taskcluster-lib-testing',
  monitor:        'taskcluster-lib-monitor',
  scopes:         'taskcluster-lib-scopes',
  docs:           'taskcluster-lib-docs',
  Iterate:        'taskcluster-lib-iterate',
}, function(module, name) {
  require.resolve(module);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        function() { return require(module); }
  });
});


// We want deprecation warnings when someone tries to use a deprecated
// api
_.forIn({
  LegacyEntity:   'taskcluster-lib-legacyentities',
  AzureAgent:     'taskcluster-lib-legacyentities/azureagent',
  stats:          'taskcluster-lib-stats',
  utils:          './utils'
}, function(module, name) {
  require.resolve(module);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        util.deprecate(function() { return require(module); },
        '"taskcluster-base.' + name + '" is deprecated!'),
  });
});


