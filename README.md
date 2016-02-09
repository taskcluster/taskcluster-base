TaskCluster Base Modules
========================

<img src="https://tools.taskcluster.net/lib/assets/taskcluster-120.png" />

[![Build Status](https://travis-ci.org/taskcluster/taskcluster-base.svg?branch=master)](http://travis-ci.org/taskcluster/taskcluster-base)
[![License](https://img.shields.io/badge/license-MPL%202.0-orange.svg)](https://github.com/taskcluster/taskcluster-base/blob/master/LICENSE)

A collection of common modules used many taskcluster components.

Most of the modules in this _base_ collection can be instantiated by providing
a JSON dictionary with configuration and parameters.


Code Conventions
----------------

 * Use `camelBack` notation for all public identifiers
 * Use `CamelCase` notation for class names
 * Wrap class constructors if asynchronous I/O is needed
 * Minimize indentation when possible
 * Employ `/** Documentation comments */`
 * Return promises whenever asynchronous I/O is needed


Testing
-------

There are no tests in this module other than assuring that everything can
be imported. Run with ```npm test``` as per usual.

Metadata Publication
--------------------
_We publish metadata for consumption by auto-generated clients and docs._

**API References** should be published to
`references.taskcluster.net/<component>/v1`, where `<component>` is a
taskcluster component, such as `queue`, `scheduler`, etc.


**Schemas** should be published to `schemas.taskcluster.net/<component>/v1`,
where `<component>` is the name of a taskcluster component, as above.


Please, **do not** publish metadata from staging area deployments or test
setups, etc. If you want to maintain deploy a different version of a component
independently please make sure to choose a unique component name or publish
the application metadata to another location.
