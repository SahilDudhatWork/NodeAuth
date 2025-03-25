const User = require("../../../models/user");
const { handleException } = require("../../../helpers/exception");
const Response = require("../../../helpers/response");
const { paginationResponse } = require("../../../utils/paginationFormate");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helpers/constant");

const fetchData = async (req, res) => {
  const { logger, query } = req;
  try {
    let { page, limit, keyWord } = query;

    let qry = {};
    if (keyWord) {
      qry = {
        $or: [
          { fullName: { $regex: keyWord, $options: "i" } },
          { email: { $regex: keyWord, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$mobile" } },
                regex: keyWord,
              },
            },
          },
        ],
      };
    }

    const offset = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = limit * (offset - 1);
    const [getData] = await User.aggregate([
      { $match: qry },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          paginatedResult: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                __v: 0,
                password: 0,
                forgotPassword: 0,
                token: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    const response = await paginationResponse(req, res, offset, limit, getData);

    return Response.success({
      req,
      res,
      status: response.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK,
      msg: response.length > 0 ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND,
      data: response,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
