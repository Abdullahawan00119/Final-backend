const express = require('express');
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { serviceValidator } = require('../validators/serviceValidator');
const validate = require('../middleware/validate');

const router = express.Router();

const { authenticate, authorize } = require('../middleware/authenticate');

router.get('/', getServices);
router.get('/:slug', getService);

// Protected routes
router.use(authenticate);

router.post('/', authorize('provider'), ...serviceValidator, validate, createService);
router.put('/:id', authorize('provider'), ...serviceValidator, validate, updateService);
router.delete('/:id', authorize('provider'), deleteService);

module.exports = router;
