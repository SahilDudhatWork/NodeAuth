const User = require("../../../models/user");
const { handleException } = require("../../../helpers/exception");
const { encrypt } = require("../../../helpers/encrypt-decrypt");
const Response = require("../../../helpers/response");
const jwt = require("jsonwebtoken");
const { signUpSchemaValidate } = require("../../../helpers/joi-validation");
const upload = require("../../../middlewares/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

// Middleware for handling file uploads
const uploadMiddleware = upload.single("profilePicture");

const signUp = async (req, res) => {
  const { logger, body, file, fileValidationError } = req;

  try {
    console.log("body", body);
    const { fullName, mobile, email = "", password, loginType, appleId } = body;

    if (!loginType) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Login Type ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    // Build query based on login type
    const query =
      loginType === "Apple"
        ? appleId
          ? { appleId }
          : {}
        : email
        ? { email }
        : {};

    // Apple ID or email is required for user lookup
    if (Object.keys(query).length === 0) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `${loginType === "Apple" ? "Apple ID" : "Email"} ${
          ERROR_MSGS.KEY_REQUIRED
        }`,
      });
    }

    // Check if user exists
    const existingUser = await User.findOne(query);

    if (existingUser) {
      const { accessToken, refreshToken } = await generateTokens(
        existingUser._id
      );
      await updateUserToken(existingUser._id, accessToken, refreshToken);

      return Response.success({
        res,
        status: STATUS_CODE.CREATED,
        msg: INFO_MSGS.SUCCESSFUL_LOGIN,
        data: { accessToken, refreshToken },
      });
    }

    // Web users must be validated and have no upload errors
    if (loginType === "Web") {
      const { error } = signUpSchemaValidate({
        fullName,
        mobile,
        email,
        password,
      });
      if (error) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: error.details[0].message,
        });
      }

      if (fileValidationError) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: fileValidationError,
        });
      }
    }

    // Hash password if required
    const hashedPassword =
      loginType === "Web"
        ? encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY)
        : null;

    // Build user data safely
    const userData = {
      fullName,
      mobile,
      loginType,
      password: hashedPassword,
      profilePicture: file ? file.path : null,
    };

    if (email && loginType !== "Apple") userData.email = email;
    if (appleId && loginType === "Apple") userData.appleId = appleId;

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    const { accessToken, refreshToken } = await generateTokens(savedUser._id);
    await updateUserToken(savedUser._id, accessToken, refreshToken);

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_REGISTER,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return handleException(logger, res, error);
  }
};

// Generate JWT Token
const generateTokens = async (userId) => {
  const encryptedUserId = encrypt(userId, process.env.USER_ENCRYPTION_KEY);

  const accessToken = jwt.sign(
    { userId: encryptedUserId, type: "Access", role: "User" },
    process.env.USER_ACCESS_TOKEN,
    { expiresIn: process.env.USER_ACCESS_TIME }
  );

  const refreshToken = jwt.sign(
    { userId: encryptedUserId, type: "Refresh", role: "User" },
    process.env.REFRESH_ACCESS_TOKEN,
    { expiresIn: process.env.REFRESH_TOKEN_TIME }
  );

  return { accessToken, refreshToken };
};

// Update User Token
const updateUserToken = async (userId, accessToken, refreshToken) => {
  await User.findByIdAndUpdate(
    userId,
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
};

module.exports = {
  uploadMiddleware,
  signUp,
};
