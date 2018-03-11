const process = require('process');

const localConfigurations = {
  SQL_USER: 'postgres',
  SQL_PASSWORD: '',
  SQL_DATABASE: 'postgres',
  INSTANCE_CONNECTION_NAME: '',
};
const productionConfigurations = {
  SQL_USER: 'postgres',
  SQL_PASSWORD: 'Vanph@t93',
  SQL_DATABASE: 'postgres',
  INSTANCE_CONNECTION_NAME: 'evisavn-188706:asia-east1:evisavn-psql',
};

module.exports =
  process.env.NODE_ENV === 'production'
    ? productionConfigurations
    : localConfigurations;
