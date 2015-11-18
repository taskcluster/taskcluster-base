"use strict";

var fs          = require('fs');
var path        = require('path');
var assert      = require('assert');
var scopes      = require('taskcluster-lib-scopes');
var util        = require('util');

/** List files in folder recursively */
exports.listFolder = util.deprecate(function(folder, fileList) {
  if (fileList == undefined) {
    fileList = [];
  }
  fs.readdirSync(folder).forEach(function(obj) {
    var objPath = path.join(folder, obj);
    if (fs.statSync(objPath).isDirectory()) {
      return exports.listFolder(objPath, fileList);
    } else {
      fileList.push(objPath);
    }
  });
  return fileList;
}, 'taskcluster-base.utils.listFolder is deprecated');

// These are here to not break the API but to use the new
// taskcluster-lib-scopes library instead of having the code inside
// taskcluster-base
exports.validScope = util.deprecate(scopes.validScope,
    'use taskcluster-lib-scopes instead of taskcluster-base.utils');
exports.validateScopeSets = util.deprecate(scopes.validateScopeSets,
    'use taskcluster-lib-scopes instead of taskcluster-base.utils');
exports.scopeMatch = util.deprecate(scopes.scopeMatch,
    'use taskcluster-lib-scopes instead of taskcluster-base.utils');
