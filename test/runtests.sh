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
  test/exchanges_test.js
  test/testing/localapp_test.js
  test/testing/localapp2_test.js
  test/testing/schemas_test.js
)

remote_tests=(
  test/pulsepublisher_test.js
  test/pulsepublisherschemaprefix_test.js
  test/api/publish_test.js
  test/exchanges_publish_test.js
  test/api/responsetimer_test.js
  test/testing/pulsetestreceiver_test.js
  test/testing/mockauthserver_test.js
  test/validator_publish_test.js
)

# tests that require external services and credentials
if $local_only; then
    tests=(${local_tests[@]})
else
    tests=(${remote_tests[@]} ${local_tests[@]})
fi

mocha ${tests[@]}
