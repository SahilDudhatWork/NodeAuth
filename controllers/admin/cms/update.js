const Cms = require("../../../models/cms");
const Response = require("../../../helpers/response");
const { handleException } = require("../../../helpers/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const convertToSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    body.slug = convertToSlug(body.title);

    const existingRecord = await Cms.findOne({ slug: body.slug });
    if (existingRecord && existingRecord._id.toString() !== id) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Title ${ERROR_MSGS.DATA_EXISTS}`,
      });
    }

    const updatedData = await Cms.findByIdAndUpdate(id, body, {
      new: true,
    });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
