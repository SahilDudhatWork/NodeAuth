const { ObjectId } = require("mongoose").Types;
const User = require("../../../models/user");
const Response = require("../../../helpers/response");
const upload = require("../../../middlewares/multer");
const { handleException } = require("../../../helpers/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const uploadMiddlewareB = upload.single("profilePicture");

const update = async (req, res) => {
  const { logger, params, body, fileValidationError, file } = req;
  try {
    const { id } = params;

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

    const fetchUserData = await User.findById(id);
    if (body.email) {
      const fetchUser = await User.findOne({ email: body.email });
      if (fetchUser && !fetchUser?._id.equals(id)) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.EMAIL_EXIST,
        });
      }
    }

    body.profilePicture = file ? file.path : fetchUserData.profilePicture;

    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(id) },
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
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
  uploadMiddlewareB,
};
