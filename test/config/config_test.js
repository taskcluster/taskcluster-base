suite("config", function() {
  var base    = require('../../');
  var path    = require('path');
  var assume  = require('assume');

  test("load yaml", function() {
    var cfg = base.config({
      files: [
        path.join(__dirname, 'test.yml')
      ]
    });

    assume(cfg).deep.equals({
      text: ['Hello', 'World']
    });
  });

  test("load profile", function() {
    var cfg = base.config({
      files: [
        path.join(__dirname, 'test-profile.yml')
      ],
      profile:  'danish'
    });

    assume(cfg).deep.equals({
      text: ['Hej', 'Verden']
    });
  });

  test("load profile (default)", function() {
    var cfg = base.config({
      files: [
        path.join(__dirname, 'test-profile.yml')
      ]
    });

    assume(cfg).deep.equals({
      text: ['Hello', 'World']
    });
  });

  test("load !env", function() {
    var cfg = base.config({
      files: [
        path.join(__dirname, 'test-env.yml')
      ],
      env: {
        ENV_VARIABLE:     'env-var-value',
        ENV_NUMBER:       '32.4',
        ENV_DEFINED:      'true',
        ENV_TRUE:         'true',
        ENV_FALSE:        'false',
        ENV_JSON:         '{"test": 42}',
        ENV_LIST:         'abc def'
      }
    });

    assume(cfg).deep.equals({
      text:       'env-var-value',
      text2:      'env-var-value',
      number:     32.4,
      unsetflag:  false,
      setflag:    true,
      soTrue:     true,
      unTrue:     false,
      json:       {test: 42},
      list:       ["abc", "def"]
    });
  });
});