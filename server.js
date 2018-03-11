const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const Knex = require('knex');
const psqlConfigs = require('./config');

const port = 8001;

//<editor-fold desc="general configs">
// Set up the express app
const app = express();
app.enable('trust proxy');

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//</editor-fold>

//<editor-fold desc="knex configs">
const knex = connect();

function connect() {
  // [START connect]
  const config = {
    user: process.env.SQL_USER || psqlConfigs.SQL_USER,
    password: process.env.SQL_PASSWORD || psqlConfigs.SQL_PASSWORD,
    database: process.env.SQL_DATABASE || psqlConfigs.SQL_DATABASE,
  };
  const instanceConnectionName =
    process.env.INSTANCE_CONNECTION_NAME || psqlConfigs.INSTANCE_CONNECTION_NAME;

  if (instanceConnectionName && process.env.NODE_ENV === 'production') {
    config.host = `/cloudsql/${instanceConnectionName}`;
  } else {
    config.host = '127.0.0.1';
  }
  console.log('xxx', config);

  // Connect to the database
  const knex = Knex({
    client: 'pg',
    connection: config,
  });
  // [END connect]

  return knex;
}
//</editor-fold>

//<editor-fold desc="endpoint configs">
app.get('/', (req, res) => res.status(200).send('evisa-vn.com API server'));
app.get('/country', (req, res, next) => {
  return getCountries(knex)
    .then(visits => {
      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Last 10 countries:\n${visits.join('\n')}`)
        .end();
    })
    .catch(err => {
      next(err);
    });
});

function getCountries(knex) {
  return knex
    .select('id', 'name')
    .from('country')
    .limit(10)
    .then(results => {
      return results.map(country => `Id: ${country.id}, name: ${country.name}`);
    });
}
//</editor-fold>

const server = http.createServer(app).listen(port, () => {
  console.log('app is listening on port ' + port);
});
