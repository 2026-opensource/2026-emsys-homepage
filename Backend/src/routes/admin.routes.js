const express = require("express");
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireAdmin, requirePresident  } = require("../middlewares/role.middleware");

const router = express.Router();


router.get("/test", 
    requireAuth, 
    requireAdmin,
    adminController.adminTest
);

router.get("/posts", requireAuth, requireAdmin, adminController.getAllPosts);

router.get("/users", 
    requireAuth, 
    requireAdmin, 
    adminController.getUsers
);

router.patch(
    "/users/status",
    requireAuth,
    requireAdmin,
    adminController.updateUsersStatus
);


router.patch(
    "/users/withdraw",
    requireAuth,
    requireAdmin,
    adminController.withdrawUsers
);

router.get(
    "/officers",
    requireAuth,
    requireAdmin,
    adminController.getOfficers
);

router.patch(
    "/officers/:userId/dismiss",
    requireAuth,
    requirePresident,
    adminController.dismissOfficer
);

router.patch(
    "/officers/:userId/appoint", 
    requireAuth, 
    requirePresident,
    adminController.appointOfficer
);

router.patch(
    "/president/delegate", 
    requireAuth, 
    requirePresident, 
    adminController.delegatePresident
);

module.exports = router;