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
    const { fullName, mobile, email, password, loginType } = body;

    if (!loginType) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Login Type ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    // Check if email already exists
    const userEmailExist = await User.findOne({ email });
    if (userEmailExist) {
      // Generate JWT tokens and update user
      const { accessToken, refreshToken } = await generateTokens(
        userEmailExist._id
      );
      await updateUserToken(userEmailExist._id, accessToken, refreshToken);

      return Response.success({
        res,
        status: STATUS_CODE.CREATED,
        msg: INFO_MSGS.SUCCESSFUL_LOGIN,
        data: { accessToken, refreshToken },
      });
    } else {
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

      const passwordHash =
        loginType === "Web"
          ? encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY)
          : null;

      // Create and save new user
      const newUser = new User({
        fullName,
        mobile,
        email,
        loginType,
        password: passwordHash,
        profilePicture: file ? file.path : null,
      });

      const saveData = await newUser.save();

      // Generate JWT tokens and update user
      const { accessToken, refreshToken } = await generateTokens(saveData._id);
      await updateUserToken(saveData._id, accessToken, refreshToken);

      return Response.success({
        res,
        status: STATUS_CODE.CREATED,
        msg: INFO_MSGS.SUCCESSFUL_REGISTER,
        data: { accessToken, refreshToken },
      });
    }
  } catch (error) {
    console.error("Signup Error:", error);
    return handleException(logger, res, error);
  }
};

// Generate JWT Token
const generateTokens = async (userId) => {
  const encryptUser = encrypt(userId, process.env.USER_ENCRYPTION_KEY);
  const accessToken = jwt.sign(
    { userId: encryptUser, type: "Access", role: "User" },
    process.env.USER_ACCESS_TOKEN,
    { expiresIn: process.env.USER_ACCESS_TIME }
  );
  const refreshToken = jwt.sign(
    { userId: encryptUser, type: "Refresh", role: "User" },
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
