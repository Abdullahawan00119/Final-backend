const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  applyToJob,
  updateJob,
  deleteJob,
  hireProvider,
  updateJobStatus
} = require('../controllers/jobController');
const { jobValidator, applyValidator } = require('../validators/jobValidator');
const validate = require('../middleware/validate');

const router = express.Router();

const { authenticate, authorize } = require('../middleware/authenticate');

router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.use(authenticate);

router.post('/', authorize('customer'), ...jobValidator, validate, createJob);
router.post('/:id/apply', authorize('provider'), ...applyValidator, validate, applyToJob);
router.put('/:id', authorize('customer'), ...jobValidator, validate, updateJob);
router.delete('/:id', authorize('customer'), deleteJob);
router.post('/:id/hire/:providerId', authorize('customer'), hireProvider);
router.patch('/:id/status', updateJobStatus);

module.exports = router;
