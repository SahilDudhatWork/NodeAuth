const { Router } = require("express");
const { sentOtp } = require("../../controllers/common/otp/sentOtp");
const { verifyOtp } = require("../../controllers/common/otp/verifyOtp");
const router = Router();

router.post("/sent/:type", sentOtp);
router.post("/verify", verifyOtp);

module.exports = router;
