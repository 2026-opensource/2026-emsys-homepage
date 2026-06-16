const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

router.get('/', eventController.getAllEvents);

router.post('/', requireAuth, requireAdmin, eventController.createEvent);

router.put('/:id', requireAuth, requireAdmin, eventController.updateEvent);

router.delete('/:id', requireAuth, requireAdmin, eventController.deleteEvent);

router.get('/excel', requireAuth, requireAdmin, eventController.getEventsForExcel);

module.exports = router;