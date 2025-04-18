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
    const { email, password, loginType, appleId } = body;

    if (!loginType) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Login Type ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    let userInfo;

    if (loginType === "Apple") {
      if (!appleId) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `Apple ID ${ERROR_MSGS.KEY_REQUIRED}`,
        });
      }

      userInfo = await User.findOne({ appleId });

      if (!userInfo) {
        // Only include safe fields for Apple login
        const newUserData = {
          appleId,
          loginType,
          ...(email ? { email } : {}), // only include email if it's present
        };

        const newUser = new User(newUserData);
        userInfo = await newUser.save();
      }
    } else {
      // Non-Apple login
      if (!email) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `Email ${ERROR_MSGS.KEY_REQUIRED}`,
        });
      }

      userInfo = await User.findOne({ email });

      if (!userInfo) {
        if (loginType !== "Web") {
          const newUser = new User({
            email,
            loginType,
            ...(password ? { password } : {}),
          });

          userInfo = await newUser.save();
        } else {
          return Response.error({
            res,
            status: STATUS_CODE.BAD_REQUEST,
            msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
          });
        }
      }
    }

    if (userInfo.loginType === "Web") {
      if (!password) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `Password ${ERROR_MSGS.KEY_REQUIRED}`,
        });
      }

      const decryptedPassword = decrypt(
        userInfo.password,
        process.env.PASSWORD_ENCRYPTION_KEY
      );

      if (password !== decryptedPassword) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.INVALID_LOGIN,
        });
      }
    } else {
      if (password) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `You can only log in with ${userInfo.loginType}, not email and password.`,
        });
      }
    }

    const encryptedUserId = encrypt(
      userInfo._id,
      process.env.USER_ENCRYPTION_KEY
    );

    const accessToken = await commonAuth(
      encryptedUserId,
      process.env.USER_ACCESS_TIME,
      process.env.USER_ACCESS_TOKEN,
      "Access"
    );

    const refreshToken = await commonAuth(
      encryptedUserId,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

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
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.log("Login Error: ", error);
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
