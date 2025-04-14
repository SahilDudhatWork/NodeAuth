const { emailAndPasswordVerification } = require("../helpers/joi-validation");
const Response = require("../helpers/response");
const { STATUS_CODE, ERROR_MSGS } = require("../helpers/constant");

const validateEmailAndPassword = async (req, res, next) => {
  const { email, password, loginType } = req.body;

  if (!email) {
    return Response.error({
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: `Email ${ERROR_MSGS.KEY_REQUIRED}`,
    });
  }

  if (loginType === "Web" && !password) {
    return Response.error({
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: `Password ${ERROR_MSGS.KEY_REQUIRED}`,
    });
  }

  // Validate email and password if password is provided
  const { error } = emailAndPasswordVerification({ email, password });
  if (error) {
    return Response.error({
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateEmailAndPassword,
};
