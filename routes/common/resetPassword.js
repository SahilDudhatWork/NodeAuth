const { Router } = require("express");
const {
  resetPassword,
} = require("../../controllers/common/forgotPassword/resetPassword");
const { verifyOtpToken } = require("../../middlewares/verifyOtpToken");
const router = Router();

router.post("/:type", verifyOtpToken, resetPassword);

module.exports = router;
