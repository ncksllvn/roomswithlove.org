const Sentry = require('@sentry/node');

Sentry.init({
  // "dsn" and "environment" are options
  // read automatically be Sentry through
  // environment variables.
  debug: process.env.SENTRY_DEBUG
});

module.exports = Sentry;
