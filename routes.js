const Knex = require('knex');
const psqlConfigs = require('./config');
const tables = require('./tables.json');

const knex = connect();

function connect() {
  // [START connect]
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
  const knex = Knex({
    client: 'pg',
    connection: config,
  });
  // [END connect]

  return knex;
}

module.exports = function(app) {
  app.get('/', (req, res) =>
    res
      .status(200)
      .send('evisa-vn.com API server, environment: ' + process.env.NODE_ENV),
  );

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
      .from(tables.country)
      .limit(10)
      .then(results => {
        return results.map(
          country => `Id: ${country.id}, name: ${country.name}`,
        );
      });
  }
};
