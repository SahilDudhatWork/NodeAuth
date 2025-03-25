const { Router } = require("express");
const { fetchProfile } = require("../../controllers/user/profile/fetchProfile");
const {
  uploadMiddleware,
  update,
} = require("../../controllers/user/profile/update");
const router = Router();

router.get("/", fetchProfile);
router.put("/", uploadMiddleware, update);

module.exports = router;
