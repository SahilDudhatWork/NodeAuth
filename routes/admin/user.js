const { Router } = require("express");
const {
  userCreate,
  uploadMiddleware,
} = require("../../controllers/admin/user/create");
const { fetchData } = require("../../controllers/admin/user/fetchData");
const { getDetails } = require("../../controllers/admin/user/getDetails");
const {
  update,
  uploadMiddlewareB,
} = require("../../controllers/admin/user/update");
const { remove } = require("../../controllers/admin/user/delete");
const {
  validateEmailAndPassword,
} = require("../../middlewares/validateEmailAndPass");
const router = Router();

router.post("/", uploadMiddleware, validateEmailAndPassword, userCreate);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", uploadMiddlewareB, update);
router.delete("/:id", remove);

module.exports = router;
