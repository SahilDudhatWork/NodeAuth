const { ObjectId } = require("mongoose").Types;
const Cms = require("../../../models/cms");
const Response = require("../../../helpers/response");
const { handleException } = require("../../../helpers/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    let [getData] = await Cms.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $project: {
          __v: 0,
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
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
