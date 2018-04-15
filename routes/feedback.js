const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  handlePostSuccess,
} = require('./utils');
const tables = require('../tables.json');

const configFeedbackApis = (app, knex) => {
  app.get('/feedback', (req, res, next) => {
    return knex
      .select()
      .from(tables.feedback)
      .then(users => handleGetSuccess(res, users))
      .catch(err => handleErrors(err, res));
  });

  app.post('/feedback', (req, res, next) => {
    const requestBody = req.body;
    if (Object.keys(requestBody).length === 0) {
      return handleBadRequest(res);
    } else {
      return knex
        .insert({
          name: requestBody.name,
          email: requestBody.email,
          phone: requestBody.phone,
          subject: requestBody.subject,
          message: requestBody.message,
        })
        .into(tables.feedback)
        .then(fee => handlePostSuccess(res, fee))
        .catch(err => handleErrors(err, res));
    }
  });
};

module.exports = { configFeedbackApis };
