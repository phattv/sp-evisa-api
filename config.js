const process = require('process');

const localConfigurations = {
  SQL_USER: 'postgres',
  SQL_PASSWORD: '',
  SQL_DATABASE: 'postgres',
};
const productionConfigurations = {
  SQL_USER: 'phat',
  SQL_PASSWORD: 'phat12345',
  SQL_DATABASE: 'evisa',
};

module.exports =
  process.env.NODE_ENV === 'production'
    ? productionConfigurations
    : localConfigurations;
