#!/bin/bash -ve
# USAGE: Run this file using `npm test` (must run from repository root)

mocha                                       \
  test/entity/create_load_test.js           \
  test/entity/modify_test.js                \
  test/entity/reload_test.js                \
  test/entity/migration_definition_test.js  \
  test/entity/query_test.js                 \
  test/entity/remove_test.js                \
  test/entity/constantkey_test.js           \
  test/entity/compositekey_test.js          \
  test/entity/hashkey_test.js               \
  test/entity/datatypes_test.js             \
  test/entity/blobtype_test.js              \
  test/entity/jsontype_test.js              \
  test/entity/slugidarray_test.js           \
  test/entity/texttype_test.js              \
  test/config_test.js                       \
  test/validator_test.js                    \
  test/api/publish_test.js                  \
  test/api/auth_test.js                     \
  test/api/route_test.js                    \
  test/api/validate_test.js                 \
  test/api/noncemanager_test.js             \
  test/api/responsetimer_test.js            \
  test/app_test.js                          \
  test/exchanges_test.js                    \
  test/publisher_test.js                    \
  test/pulsepublisher_test.js               \
  test/stats_test.js                        \
  test/testing/pulsetestreceiver_test.js    \
  test/testing/localapp_test.js             \
  test/testing/localapp2_test.js            \
  test/testing/schemas_test.js              \
  test/testing/mockauthserver_test.js       \
  ;
