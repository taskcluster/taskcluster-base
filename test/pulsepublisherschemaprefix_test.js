suite("Exchanges (Publish on Pulse w. schemaPrefix)", function() {
  var assert  = require('assert');
  var base    = require('../');
  var path    = require('path');
  var fs      = require('fs');
  var debug   = require('debug')('base:test:publish-pulse');
  var Promise = require('promise');
  var slugid  = require('slugid');
  var amqplib  = require('amqplib');

  // Load necessary configuration
  var cfg = base.config({
    envs: [
      'influxdb_connectionString',
    ],
    filename:               'taskcluster-base-test'
  });

  if (!cfg.get('influxdb:connectionString') &&
      !cfg.get('pulse:credentials:password')) {
    throw new Error("Skipping 'pulse publisher', missing config file: " +
                    "taskcluster-base-test.conf.json");
    return;
  }

  // ConnectionString for use with amqplib only
  var connectionString = [
    'amqps://',         // Ensure that we're using SSL
    cfg.get('pulse:username'),
    ':',
    cfg.get('pulse:password'),
    '@',
    cfg.get('pulse:hostname') || 'pulse.mozilla.org',
    ':',
    5671                // Port for SSL
  ].join('');

  var influx = null;
  var exchanges = null;
  setup(function() {
    exchanges = new base.Exchanges({
      title:              "Title for my Events",
      description:        "Test exchanges used for testing things only",
      schemaPrefix:       'http://localhost:1203/'
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
          name:           'index',
          summary:        "index of something",
          multipleWords:  false,
          required:       false,
          maxSize:        3
        }, {
          name:           'myConstant',
          summary:        "Some constant to test",
          constant:       "-constant-"
        }
      ],
      schema:             'exchange-test-schema.json#',
      messageBuilder:     function(msg) { return msg; },
      routingKeyBuilder:  function(msg, rk) { return rk; },
      CCBuilder:          function() {return ["something.cced"];}
    });
    // Create validator to validate schema
    var validator = new base.validator.Validator();
    // Load exchange-test-schema.json schema from disk
    var schemaPath = path.join(__dirname, 'schemas', 'exchange-test-schema.json');
    var schema = fs.readFileSync(schemaPath, {encoding: 'utf-8'});
    validator.register(JSON.parse(schema));

    // Create influx db connection for report statistics
    influx = new base.stats.Influx({
      connectionString:   cfg.get('influxdb:connectionString')
    });

    // Set options on exchanges
    exchanges.configure({
      validator:              validator,
      credentials:            cfg.get('pulse')
    });
  });

  // Test that we can connect to AMQP server
  test("connect", function() {
    return exchanges.connect().then(function(publisher) {
      assert(publisher instanceof base.Exchanges.Publisher,
             "Should get an instance of base.Exchanges.Publisher");
    });
  });

  // Test that we can publish messages
  test("publish message", function() {
    return exchanges.connect().then(function(publisher) {
      return publisher.testExchange({someString: "My message"}, {
        testId:           "myid",
        taskRoutingKey:   "some.string.with.dots",
        state:            undefined // Optional
      });
    });
  });
});