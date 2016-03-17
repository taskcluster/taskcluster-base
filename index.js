"use strict";

// Lazy load all submodules, not many production systems need to load
// 'testing' and loading code actually takes time.
var _ = require('lodash');
var util = require('util');
_.forIn({
  config:         'typed-env-config',
  app:            'taskcluster-lib-app',
  validator:      'taskcluster-lib-validate',
  API:            'taskcluster-lib-api',
  Entity:         'azure-entities',
  loader:         'taskcluster-lib-loader',
  Exchanges:      'pulse-publisher',
  testing:        'taskcluster-lib-testing',
  stats:          'taskcluster-lib-stats',
  scopes:         'taskcluster-lib-scopes',
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
  utils:          './utils'
}, function(module, name) {
  require.resolve(module);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        util.deprecate(function() { return require(module); },
        '"taskcluster-base.' + name + '" is deprecated!'),
  });
});


