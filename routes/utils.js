function handleGetSuccess(res, data) {
  return res
    .status(200)
    .send(data)
    .end();
}

function handlePutSuccess(res, data) {
  return res
    .status(200)
    .send({ message: 'Updated Successfully', data })
    .end();
}

function handlePostSuccess(res, data) {
  return res
    .status(200)
    .send({ message: 'Inserted Successfully', data })
    .end();
}

function handleDeleteSuccess(res, data) {
  return res
    .status(200)
    .send({ message: 'Deleted Successfully', data })
    .end();
}

function handleBadRequest(res, message) {
  return res
    .status(400)
    .send({ error: 'error', message: message || 'Bad Request' });
}

function handleErrors(err, res) {
  console.log('xxx ERROR!', err);
  res
    .status(400)
    .send({
      error: err,
      message: err.detail || err.stack,
    })
    .end();
}

function parseParams(params) {
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      if (params[key] === '' || params[key] === undefined) {
        params[key] = null;
      }
    }
  }

  return params;
}

module.exports = {
  handleGetSuccess,
  handleBadRequest,
  handleErrors,
  handlePutSuccess,
  handlePostSuccess,
  handleDeleteSuccess,
  parseParams,
};
