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

const userCreate = async (req, res) => {
  const { logger, body, file, fileValidationError } = req;
  try {
    const { fullName, mobile, email, password } = body;

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

    // Check if email already exists
    const userEmailExist = await User.findOne({ email });
    if (userEmailExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      });
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    // Prepare user data
    const newUser = new User({
      fullName,
      mobile,
      email,
      password: passwordHash,
      profilePicture: file ? file.path : null,
    });

    // Save user
    const saveData = await newUser.save();

    // Generate JWT tokens
    const encryptUser = encrypt(saveData._id, process.env.USER_ENCRYPTION_KEY);
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
      saveData._id,
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
      msg: INFO_MSGS.CREATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("Signup Error:", error);
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
  uploadMiddleware,
  userCreate,
};
