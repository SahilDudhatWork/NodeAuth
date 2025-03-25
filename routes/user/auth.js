const { Router } = require("express");
const { logIn } = require("../../controllers/user/auth/logIn");
const { userAuth } = require("../../middlewares/authToken/userAuth");
const {
  uploadMiddleware,
  signUp,
} = require("../../controllers/user/auth/signUp");
const {
  validateEmailAndPassword,
} = require("../../middlewares/validateEmailAndPass");
const router = Router();

router.post("/signUp", uploadMiddleware, validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);

router.use(userAuth);

module.exports = router;
