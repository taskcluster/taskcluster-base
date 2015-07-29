suite("Exchanges", function() {
  var assert  = require('assert');
  var base    = require('../');
  var debug   = require('debug')('base:test:exchanges');

  test("declare", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    // Check that we can declare an exchange
    exchanges.declare({
      exchange:           'test-exchange',
      name:               'testExchange',
      title:              "Test Exchange",
      description:        "Place we post message for **testing**.",
      routingKey: [
        {
          name:           'testId',
          summary:        "Identifier that we use for testing",
          multipleWords:  false,
          required:       true,
          maxSize:        22
        }, {
          name:           'taskRoutingKey',
          summary:        "Test specific routing-key: `test.key`",
          multipleWords:  true,
          required:       true,
          maxSize:        128
        }, {
          name:           'state',
          summary:        "State of something",
          multipleWords:  false,
          required:       false,
          maxSize:        16
        }
      ],
      schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
      messageBuilder:     function(test) { return test; },
      routingKeyBuilder:  function(test, state) {
        return {
          testId:           test.id,
          taskRoutingKey:   test.key,
          state:            state
        }
      },
      CCBuilder:          function() { return []; }
    });
  });


  test("declare two", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    // Check that we can declare an exchange
    exchanges.declare({
      exchange:           'test-exchange',
      name:               'testExchange',
      title:              "Test Exchange",
      description:        "Place we post message for **testing**.",
      routingKey: [
        {
          name:           'testId',
          summary:        "Identifier that we use for testing",
          multipleWords:  false,
          required:       true,
          maxSize:        22
        }, {
          name:           'taskRoutingKey',
          summary:        "Test specific routing-key: `test.key`",
          multipleWords:  true,
          required:       true,
          maxSize:        128
        }, {
          name:           'state',
          summary:        "State of something",
          multipleWords:  false,
          required:       false,
          maxSize:        16
        }
      ],
      schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
      messageBuilder:     function(test) { return test; },
      routingKeyBuilder:  function(test, state) {
        return {
          testId:           test.id,
          taskRoutingKey:   test.key,
          state:            state
        }
      },
      CCBuilder:          function() { return []; }
    });
    exchanges.declare({
      exchange:           'test-exchange2',
      name:               'testExchange2',
      title:              "Test Exchange",
      description:        "Place we post message for **testing**.",
      routingKey: [
        {
          name:           'testId',
          summary:        "Identifier that we use for testing",
          multipleWords:  false,
          required:       true,
          maxSize:        22
        }, {
          name:           'taskRoutingKey',
          summary:        "Test specific routing-key: `test.key`",
          multipleWords:  true,
          required:       true,
          maxSize:        128
        }, {
          name:           'state',
          summary:        "State of something",
          multipleWords:  false,
          required:       false,
          maxSize:        16
        }
      ],
      schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
      messageBuilder:     function(test) { return test; },
      routingKeyBuilder:  function(test, state) {
        return {
          testId:           test.id,
          taskRoutingKey:   test.key,
          state:            state
        }
      },
      CCBuilder:          function() { return []; }
    });
  });


  test("reference", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    // Check that we can declare an exchange
    exchanges.declare({
      exchange:           'test-exchange',
      name:               'testExchange',
      title:              "Test Exchange",
      description:        "Place we post message for **testing**.",
      routingKey: [
        {
          name:           'testId',
          summary:        "Identifier that we use for testing",
          multipleWords:  false,
          required:       true,
          maxSize:        22
        }, {
          name:           'taskRoutingKey',
          summary:        "Test specific routing-key: `test.key`",
          multipleWords:  true,
          required:       true,
          maxSize:        128
        }, {
          name:           'state',
          summary:        "State of something",
          multipleWords:  false,
          required:       false,
          maxSize:        16
        }, {
          name:           'myConstant',
          summary:        "Some constant to test",
          constant:       "-constant-"
        }
      ],
      schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
      messageBuilder:     function(test) { return test; },
      routingKeyBuilder:  function(test, state) {
        return {
          testId:           test.id,
          taskRoutingKey:   test.key,
          state:            state
        }
      },
      CCBuilder:          function() { return []; }
    });

    var reference = exchanges.reference();
    assert(reference.exchangePrefix === '');
    var referencePrefixed = exchanges.reference({exchangePrefix: 'v1/'});
    assert(referencePrefixed.exchangePrefix === 'v1/');
  });


  test("reference (pulse)", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only",
      exchangePrefix:     'v1/'
    });
    // Check that we can declare an exchange
    exchanges.declare({
      exchange:           'test-exchange',
      name:               'testExchange',
      title:              "Test Exchange",
      description:        "Place we post message for **testing**.",
      routingKey: [
        {
          name:           'testId',
          summary:        "Identifier that we use for testing",
          multipleWords:  false,
          required:       true,
          maxSize:        22
        }, {
          name:           'taskRoutingKey',
          summary:        "Test specific routing-key: `test.key`",
          multipleWords:  true,
          required:       true,
          maxSize:        128
        }, {
          name:           'state',
          summary:        "State of something",
          multipleWords:  false,
          required:       false,
          maxSize:        16
        }, {
          name:           'myConstant',
          summary:        "Some constant to test",
          constant:       "-constant-"
        }
      ],
      schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
      messageBuilder:     function(test) { return test; },
      routingKeyBuilder:  function(test, state) {
        return {
          testId:           test.id,
          taskRoutingKey:   test.key,
          state:            state
        }
      },
      CCBuilder:          function() { return []; }
    });

    var reference = exchanges.reference({
      credentials: {
        username:   'test-user'
      }
    });

    assert(reference.exchangePrefix === 'exchange/test-user/v1/');
  });

  // Test that we can't declare too long routing keys
  test("error declare too long routing key", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    try {
      exchanges.declare({
        exchange:           'test-exchange',
        name:               'testExchange',
        title:              "Test Exchange",
        description:        "Place we post message for **testing**.",
        routingKey: [
          {
            name:           'testId',
            summary:        "Identifier that we use for testing",
            multipleWords:  false,
            required:       true,
            maxSize:        22
          }, {
            name:           'taskRoutingKey',
            summary:        "Test specific routing-key: `test.key`",
            multipleWords:  true,
            required:       true,
            maxSize:        128
          }, {
            name:           'state',
            summary:        "State of something",
            multipleWords:  false,
            required:       false,
            maxSize:        128
          }
        ],
        schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
        messageBuilder:     function(test) { return test; },
        routingKeyBuilder:  function(test, state) {
          return {
            testId:           test.id,
            taskRoutingKey:   test.key,
            state:            state
          }
        },
        CCBuilder:          function() { return []; }
      });
    }
    catch(err) {
      debug("Got expected Error: %s, %j", err, err);
      return;
    }
    assert(false, "Expected an exception");
  });

  // Test that we can't declare two multipleWords entries in a routing key
  test("error declare two multipleWords routing key entries", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    try {
      exchanges.declare({
        exchange:           'test-exchange',
        name:               'testExchange',
        title:              "Test Exchange",
        description:        "Place we post message for **testing**.",
        routingKey: [
          {
            name:           'testId',
            summary:        "Identifier that we use for testing",
            multipleWords:  false,
            required:       true,
            maxSize:        22
          }, {
            name:           'taskRoutingKey',
            summary:        "Test specific routing-key: `test.key`",
            multipleWords:  true,
            required:       true,
            maxSize:        128
          }, {
            name:           'anotherMultiKey',
            summary:        "Another multiple word key, shouldn't be allowed",
            multipleWords:  true,
            required:       false,
            maxSize:        22
          }
        ],
        schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
        messageBuilder:     function(test) { return test; },
        routingKeyBuilder:  function(test, state) {
          return {
            testId:           test.id,
            taskRoutingKey:   test.key,
            state:            state
          }
        },
        CCBuilder:          function() { return []; }
      });
    }
    catch(err) {
      debug("Got expected Error: %s, %j", err, err);
      return;
    }
    assert(false, "Expected an exception");
  });

  test("declare (error without CCBuilder)", function() {
    // Create an exchanges
    var exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only"
    });
    var error = null;
    try {
      // Check that we can declare an exchange
      exchanges.declare({
        exchange:           'test-exchange',
        name:               'testExchange',
        title:              "Test Exchange",
        description:        "Place we post message for **testing**.",
        routingKey: [
          {
            name:           'testId',
            summary:        "Identifier that we use for testing",
            multipleWords:  false,
            required:       true,
            maxSize:        22
          }, {
            name:           'taskRoutingKey',
            summary:        "Test specific routing-key: `test.key`",
            multipleWords:  true,
            required:       true,
            maxSize:        128
          }, {
            name:           'state',
            summary:        "State of something",
            multipleWords:  false,
            required:       false,
            maxSize:        16
          }
        ],
        schema: 'http://schemas.taskcluster.net/base/tests/exchanges-test.json',
        messageBuilder:     function(test) { return test; },
        routingKeyBuilder:  function(test, state) {
          return {
            testId:           test.id,
            taskRoutingKey:   test.key,
            state:            state
          }
        },
      });
    }
    catch(err) {
      error = err;
    }
    assert(error, "Didn't get an error!");
  });
});
