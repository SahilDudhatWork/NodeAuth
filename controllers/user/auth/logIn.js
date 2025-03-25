const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
const { decrypt, encrypt } = require("../../../helpers/encrypt-decrypt");
const { handleException } = require("../../../helpers/exception");
const Response = require("../../../helpers/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");
require("dotenv").config();

// Login
const logIn = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, password } = body;

    let userInfo = await User.aggregate([{ $match: { email: email } }]);
    userInfo = userInfo[0];
    if (!userInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const decryptPassword = decrypt(
      userInfo.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );

    if (password !== decryptPassword) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_LOGIN,
      };
      return Response.error(obj);
    }

    const encryptUser = encrypt(userInfo._id, process.env.USER_ENCRYPTION_KEY);
    const accessToken = await commonAuth(
      encryptUser,
      process.env.USER_ACCESS_TIME,
      process.env.USER_ACCESS_TOKEN,
      "Access"
    );
    const refreshToken = await commonAuth(
      encryptUser,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

    // Update user with token details
    await User.findByIdAndUpdate(
      userInfo._id,
      {
        lastLogin: new Date(),
        token: {
          accessToken,
          refreshToken,
          type: "Access",
          createdAt: new Date(),
        },
      },
      { new: true }
    );
    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      data:{
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

// Generate JWT Token
const commonAuth = async (encryptUser, expiresIn, secret, type) => {
  try {
    return jwt.sign({ userId: encryptUser, type, role: "User" }, secret, {
      expiresIn,
    });
  } catch (error) {
    console.error("commonAuth Error:", error);
    throw error;
  }
};

module.exports = {
  logIn,
};
