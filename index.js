"use strict";

// Lazy load all submodules, not many production systems need to load
// 'testing' and loading code actually takes time.
var _ = require('lodash');
_.forIn({
  config:         'typed-env-config',
  app:            'taskcluster-lib-app',
  validator:      'schema-validator-publisher',
  API:            'taskcluster-lib-api',
  Entity:         'azure-entities',
  LegacyEntity:   'taskcluster-lib-legacyentities',
  AzureAgent:     'taskcluster-lib-legacyentities/azureagent',
  loader:         'taskcluster-lib-loader',
  Exchanges:      'pulse-publisher',
  testing:        'taskcluster-lib-testing',
  stats:          'taskcluster-lib-stats',
  scopes:         'taskcluster-lib-scopes',
  utils:          './utils'
}, function(module, name) {
  require.resolve(module);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        function() { return require(module); }
  });
});
