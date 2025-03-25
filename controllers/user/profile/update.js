const User = require("../../../models/user");
const { handleException } = require("../../../helpers/exception");
const Response = require("../../../helpers/response");
const { ObjectId } = require("mongoose").Types;
const upload = require("../../../middlewares/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

// Middleware for handling file uploads
const uploadMiddleware = upload.single("profilePicture");

const update = async (req, res) => {
  const { logger, userId, body, file, fileValidationError } = req;
  try {
    const { email } = body;

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

    const fetchUser = await User.findOne({ email });
    if (fetchUser && !fetchUser?._id.equals(userId)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }

    body.profilePicture = file ? file.path : fetchUser.profilePicture;

    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(userId) },
      body,
      { new: true }
    );

    const result = updateData.toObject();
    delete result.password;
    delete result.token;
    delete result.forgotPassword;
    delete result.__v;

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadMiddleware,
  update,
};
