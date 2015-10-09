#!/bin/bash -e
# USAGE: Run this file using `npm test` or `npm run-script test-local`
# (must run from repository root)

case $1 in
    local) local_only=true ;;
    full) local_only=false ;;
    *)
        echo "Specify either 'local' or 'full'"
        exit 1
        ;;
esac

# tests that can run locally
local_tests=(
  test/validator_test.js
  test/api/auth_test.js
  test/api/route_test.js
  test/api/validate_test.js
  test/api/schemaprefix_test.js
  test/api/noncemanager_test.js
  test/app_test.js
  test/scopematch_test.js
  test/exchanges_test.js
  test/testing/localapp_test.js
  test/testing/localapp2_test.js
  test/entity/migration_definition_test.js
  test/testing/schemas_test.js
)

remote_tests=(
  test/pulsepublisher_test.js
  test/pulsepublisherschemaprefix_test.js
  test/api/publish_test.js
  test/exchanges_publish_test.js
  test/api/responsetimer_test.js
  test/testing/pulsetestreceiver_test.js
  test/entity/create_load_test.js
  test/entity/context_test.js
  test/entity/modify_test.js
  test/entity/reload_test.js
  test/testing/mockauthserver_test.js
  test/entity/query_test.js
  test/entity/remove_test.js
  test/entity/constantkey_test.js
  test/entity/compositekey_test.js
  test/entity/hashkey_test.js
  test/entity/datatypes_test.js
  test/entity/blobtype_test.js
  test/entity/jsontype_test.js
  test/entity/slugidarray_test.js
  test/entity/texttype_test.js
  test/entity/encryptedblobtype_test.js
  test/entity/encryptedtexttype_test.js
  test/entity/encryptedjsontype_test.js
  test/entity/signentities_test.js
  test/entity/encryptedprops_test.js
  test/entity/sas_test.js
  test/entity/auth_test.js
  test/legacyentity_test.js
  test/validator_publish_test.js
)

# tests that require external services and credentials
if $local_only; then
    tests=(${local_tests[@]})
else
    tests=(${remote_tests[@]} ${local_tests[@]})
fi

mocha ${tests[@]}
