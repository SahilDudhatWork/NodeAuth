const { ObjectId } = require("mongoose").Types;
const Admin = require("../../../models/admin");
const Response = require("../../../helpers/response");
const { handleException } = require("../../../helpers/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const fetchProfile = async (req, res) => {
  let { logger, adminId } = req;
  try {
    let [getData] = await Admin.aggregate([
      {
        $match: {
          _id: new ObjectId(adminId),
        },
      },
      {
        $project: {
          __v: 0,
          password: 0,
          forgotPassword: 0,
          token: 0,
        },
      },
    ]);

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchProfile,
};
