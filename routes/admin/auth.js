const { Router } = require("express");
const router = Router();
const { logIn } = require("../../controllers/admin/auth/logIn");
const { signUp } = require("../../controllers/admin/auth/signUp");
const {
  validateEmailAndPassword,
} = require("../../middlewares/validateEmailAndPass");
const { adminAuth } = require("../../middlewares/authToken/adminAuth");

router.post("/signUp", validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);

module.exports = router;
