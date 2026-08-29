const errorResponseBody = {
  err: {},
  data: {},
  message: "something went wrong, can't process the request",
  success: false,
};

const successResponseBody = {
  err: {},
  data: {},
  message: "successfully process the request",
  success: true,
};

module.exports = {
    errorResponseBody,
    successResponseBody
}