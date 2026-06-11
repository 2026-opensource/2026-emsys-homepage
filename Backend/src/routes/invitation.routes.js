const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitation.controller");

router.get("/", invitationController.getInvitationCode);

module.exports = router;