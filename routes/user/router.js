const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const cmsRoute = require("./cms");
const { userAuth } = require("../../middlewares/authToken/userAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "User routes is working!!" });
});

router.use("/auth", authRoute);
router.use(userAuth);
router.use("/profile", profileRoute);
router.use("/cms", cmsRoute);

module.exports = router;
