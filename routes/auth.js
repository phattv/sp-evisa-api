const bcrypt = require('bcrypt');
const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  handlePostSuccess,
} = require('./utils');
const tables = require('../tables.json');
const { visibleFields } = require('./users');

const configAuthApis = (app, knex) => {
  app.post('/register', (req, res, next) => {
    const requestBody = req.body;
    if (Object.keys(requestBody).length === 0) {
      return handleBadRequest(res);
    } else {
      knex
        .select()
        .from(tables.user)
        .where('email', requestBody.email)
        .first()
        .then(user => {
          if (user) {
            return handleBadRequest(res, 'email exists');
          } else {
            const salt = bcrypt.genSaltSync();
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);

            return knex
              .insert({
                email: requestBody.email,
                password: hashedPassword,
                name: requestBody.name,
                gender: requestBody.gender,
                phone: requestBody.phone,
                country_id: requestBody.country_id,
                passport: requestBody.passport,
                passport_expiry: requestBody.passport_expiry,
                birthday: requestBody.birthday,
                is_admin: false,
              })
              .into(tables.user)
              .then(user => handlePostSuccess(res, user))
              .catch(err => handleErrors(err, res));
          }
        })
        .catch(err => handleErrors(err, res));
    }
  });

  app.post('/login', (req, res, next) => {
    const requestBody = req.body;

    if (Object.keys(requestBody).length === 0) {
      return handleBadRequest(res);
    } else {
      knex
        .select()
        .from(tables.user)
        .where('email', requestBody.email)
        .first()
        .then(user => {
          if (!user) {
            return handleBadRequest(res, 'Incorrect email or password');
          } else {
            const isPasswordCorrect = bcrypt.compareSync(
              requestBody.password,
              user.password,
            );
            if (user && isPasswordCorrect) {
              const responseData = {};
              visibleFields.forEach(
                visibleField =>
                  (responseData[visibleField] = user[visibleField]),
              );
              return handleGetSuccess(res, responseData);
            }
          }
        })
        .catch(err => handleErrors(err, res));
    }
  });

  // TODO: /reset
};

module.exports = { configAuthApis };
