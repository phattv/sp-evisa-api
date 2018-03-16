const express = require('express'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  http = require('http'),
  compression = require('compression');

const port = 8001;

// Set up the express app
const app = express();
app.enable('trust proxy');

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(compression());

require('./routes')(app);

http.createServer(app).listen(port, () => {
  console.log('environment:', process.env.NODE_ENV);
  console.log('app is listening on port ' + port);
});
