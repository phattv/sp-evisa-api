function handleGetSuccess(res, data) {
  return res
    .status(200)
    .send(data)
    .end();
}

function handlePutSuccess(res) {
  return res
    .status(200)
    .send({ message: 'Updated Successfully' })
    .end();
}

function handlePostSuccess(res) {
  return res
    .status(200)
    .send({ message: 'Inserted Successfully' })
    .end();
}

function handleDeleteSuccess(res) {
  return res
    .status(200)
    .send({ message: 'Deleted Successfully' })
    .end();
}

function handleBadRequest(res, message) {
  return res.status(400).send(message || 'Bad Request');
}

function handleErrors(err, res) {
  console.log('xxx ERROR!', err);
  res
    .status(400)
    .send({
      error: err,
      message: err.detail || err.stack
    })
    .end();
}

module.exports = {
  handleGetSuccess,
  handleBadRequest,
  handleErrors,
  handlePutSuccess,
  handlePostSuccess,
  handleDeleteSuccess
};
