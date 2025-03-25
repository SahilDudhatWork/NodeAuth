const { Router } = require("express");
const { create } = require("../../controllers/admin/cms/create");
const { fetchData } = require("../../controllers/admin/cms/fetchData");
const { getDetails } = require("../../controllers/admin/cms/getDetails");
const { update } = require("../../controllers/admin/cms/update");
const { remove } = require("../../controllers/admin/cms/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
