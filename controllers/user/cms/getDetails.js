const Cms = require("../../../models/cms");
const { handleException } = require("../../../helpers/exception");
const Response = require("../../../helpers/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const getDetails = async (req, res) => {
  let { logger, params } = req;
  try {
    const { slug } = params;
    let getData = await Cms.findOne({ slug });

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
  getDetails,
};
