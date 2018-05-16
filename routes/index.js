const Knex = require('knex');
const psqlConfigs = require('../config');
const knex = connect();

const { configCountryApis } = require('./countries');
const { configFeeApis } = require('./fees');
const { configUserApis } = require('./users');
const { configAuthApis } = require('./auth');
const { configFeedbackApis } = require('./feedback');
const { configOrderApis } = require('./orders');

function connect() {
  const isProduction = process.env.NODE_ENV === 'production';
  const config = {
    user: process.env.SQL_USER || psqlConfigs.SQL_USER,
    password: process.env.SQL_PASSWORD || psqlConfigs.SQL_PASSWORD,
    database: process.env.SQL_DATABASE || psqlConfigs.SQL_DATABASE,
    host: isProduction ? '10.148.0.2' : '127.0.0.1'
  };

  // Connect to the database
  return Knex({
    client: 'pg',
    connection: config
  });
}

module.exports = app => {
  app.get('/', (req, res) =>
    res
      .status(200)
      .send('evisa-vn.com API server, environment: ' + process.env.NODE_ENV)
  );

  configCountryApis(app, knex);
  configFeeApis(app, knex);
  configUserApis(app, knex);
  configAuthApis(app, knex);
  configFeedbackApis(app, knex);
  configOrderApis(app, knex);
};
