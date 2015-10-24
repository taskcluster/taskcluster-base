"use strict";

var fs          = require('fs');
var path        = require('path');
var assert      = require('assert');
var scopes      = require('taskcluster-lib-scopes');

/** List files in folder recursively */
exports.listFolder = function(folder, fileList) {
  console.log('**********************');
  console.log('**    DEPRECATED!   **');
  console.log('**********************');
  console.log('');
  console.log('******************************************************');;
  console.log('* You are calling taskcluster-base.utils.listFolder  *');
  console.log('* which is deprecated and will be removed very soon. *');
  console.log('******************************************************');;
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
};

// These are here to not break the API but to use the new
// taskcluster-lib-scopes library instead of having the code inside
// taskcluster-base
exports.validScope = scopes.validScope;
exports.validateScopeSets = scopes.validateScopeSets;
exports.scopeMatch = scopes.scopeMatch;
