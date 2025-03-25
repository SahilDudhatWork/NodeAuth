const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const userRoute = require("./user");
const cmsRoute = require("./cms");
const { adminAuth } = require("../../middlewares/authToken/adminAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Admin routes is working!!" });
});

router.use("/auth", authRoute);
router.use(adminAuth);
router.use("/profile", profileRoute);
router.use("/user", userRoute);
router.use("/cms", cmsRoute);

module.exports = router;
