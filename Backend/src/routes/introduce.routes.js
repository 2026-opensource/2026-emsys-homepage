const express = require("express");
const router = express.Router();
const publicController = require("../controllers/introduce.controller");

router.get("/executives", publicController.getIntroduceExecutives);

module.exports = router;