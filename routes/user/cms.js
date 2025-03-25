const { Router } = require("express");
const { getAll } = require("../../controllers/user/cms/getAll");
const { getDetails } = require("../../controllers/user/cms/getDetails");
const router = Router();

router.get("/", getAll);
router.get("/:slug", getDetails);

module.exports = router;
