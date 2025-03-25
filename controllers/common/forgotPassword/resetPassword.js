const { validateResetPassword } = require("../../../helpers/joi-validation");
const { handleException } = require("../../../helpers/exception");
const Response = require("../../../helpers/response");
const { encrypt, decrypt } = require("../../../helpers/encrypt-decrypt");
const { hendleModel } = require("../../../utils/hendleModel");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const resetPassword = async (req, res) => {
  const { logger, params, body } = req;

  try {
    const { oldPassword, newPassword } = body;
    const { email } = req;
    const { type } = params;

    if (!oldPassword || !newPassword) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_PASSWORD,
      });
    }

    const { error } = validateResetPassword({ password: newPassword });
    if (error) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      });
    }

    const Model = await hendleModel(type);
    const user = await Model.findOne({ email });

    if (!user) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_EXISTS,
      });
    }

    const decryptedOldPassword = decrypt(
      user.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );
    if (decryptedOldPassword !== oldPassword) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.OLD_PASSWORD_INCORRECT,
      });
    }

    const encryptedNewPassword = encrypt(
      newPassword,
      process.env.PASSWORD_ENCRYPTION_KEY
    );
    await Model.findByIdAndUpdate(
      user._id,
      {
        password: encryptedNewPassword,
        "forgotPassword.createdAt": Date.now(),
      },
      { new: true }
    );

    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.PASSWORD_CHANGED,
    });
  } catch (error) {
    console.log("resetPassword Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = { resetPassword };
