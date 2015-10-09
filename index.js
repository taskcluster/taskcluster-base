"use strict";

// Lazy load all submodules, not many production systems need to load
// 'testing' and loading code actually takes time.
var _ = require('lodash');
_.forIn({
  config:         'taskcluster-lib-config',
  app:            './app',
  validator:      './validator',
  API:            './api',
  Entity:         './lib/entity',
  LegacyEntity:   './lib/legacyentity',
  loader:         'taskcluster-lib-loader',
  AzureAgent:     './lib/azureagent',
  Exchanges:      './exchanges',
  testing:        './testing',
  stats:          'taskcluster-lib-config',
  utils:          './utils'
}, function(module, name) {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        function() { return require(module); }
  });
});
