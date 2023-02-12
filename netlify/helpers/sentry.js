const Sentry = require('@sentry/node');

// Importing @sentry/tracing patches the global hub for tracing to work.
require("@sentry/tracing");

Sentry.init({
  // "dsn" and "environment" are options
  // read automatically be Sentry through
  // environment variables.
  debug: process.env.SENTRY_DEBUG,
  tracesSampleRate: 1.0
});

module.exports = Sentry;
