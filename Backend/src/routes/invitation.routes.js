const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitation.controller");

router.get(
    "/",
    (req, res, next) => {
        res.set("Cache-Control", "no-store");
        next();
    },
    invitationController.getInvitationCode
);

module.exports = router;