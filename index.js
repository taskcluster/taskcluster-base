"use strict";

// Lazy load all submodules, not many production systems need to load
// 'testing' and loading code actually takes time.
var _ = require('lodash');
_.forIn({
  legacyConfig:   './config',
  config:         './lib/config',
  app:            './app',
  validator:      './validator',
  API:            './api',
  Entity:         './lib/entity',
  LegacyEntity:   './lib/legacyentity',
  AzureAgent:     './lib/azureagent',
  Exchanges:      './exchanges',
  testing:        './testing',
  stats:          './lib/stats',
  utils:          './utils'
}, function(module, name) {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get:        function() { return require(module); }
  });
});
