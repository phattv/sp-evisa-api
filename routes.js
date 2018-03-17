const Knex = require('knex');
const psqlConfigs = require('./config');
const tables = require('./tables.json');

const knex = connect();

function connect() {
  const config = {
    user: process.env.SQL_USER || psqlConfigs.SQL_USER,
    password: process.env.SQL_PASSWORD || psqlConfigs.SQL_PASSWORD,
    database: process.env.SQL_DATABASE || psqlConfigs.SQL_DATABASE,
  };
  const instanceConnectionName =
    process.env.INSTANCE_CONNECTION_NAME ||
    psqlConfigs.INSTANCE_CONNECTION_NAME;

  if (instanceConnectionName && process.env.NODE_ENV === 'production') {
    config.socketPath = `/cloudsql/${instanceConnectionName}`;
  } else {
    config.host = '127.0.0.1';
  }

  // Connect to the database
  return Knex({
    client: 'pg',
    connection: config,
  });
}

module.exports = app => {
  app.get('/', (req, res) =>
    res
      .status(200)
      .send('evisa-vn.com API server, environment: ' + process.env.NODE_ENV),
  );

  app.get('/country', (req, res, next) => {
    return knex
      .select()
      .from(tables.country)
      .then(countries => {
        res
          .status(200)
          .send(countries)
          .end();
      })
      .catch(err => logErrors(err, next));
  });

  app.get('/fee', (req, res, next) => {
    if (Object.keys(req.query) === 0) {
      return res.status(400).end();
    } else {
      return knex
        .select()
        .from(tables.fee)
        .where('country_iso3', req.query.id)
        .then(fees => {
          res
            .status(200)
            .send(fees)
            .end();
        })
        .catch(err => logErrors(err, next));
    }
  });
};

function logErrors(err, next) {
  console.error('xxx ERROR!', err.stack);
  next(err);
}
