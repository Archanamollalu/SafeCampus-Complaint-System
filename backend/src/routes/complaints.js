const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Get my complaints (student only) - MUST be before /:id route
router.get('/my', authorize('student'), complaintController.getAllComplaints);

// Get complaint statistics
router.get('/stats', complaintController.getStatistics);

// Get all complaints (with filters)
router.get('/', complaintController.getAllComplaints);

// Get complaints by status
router.get('/status/:status', complaintController.getAllComplaints);

// Create new complaint (student only)
router.post(
  '/',
  authorize('student'),
  upload.array('evidence', 5),
  complaintController.createComplaint
);

// Get single complaint
router.get('/:id', complaintController.getComplaint);

// Update complaint (owner or admin)
router.put('/:id', complaintController.updateComplaint);

// Delete complaint (owner or admin)
router.delete('/:id', complaintController.deleteComplaint);

// Update complaint status (admin/staff only)
router.patch(
  '/:id/status',
  authorize('admin', 'staff'),
  complaintController.updateStatus
);

// Add response to complaint (admin/staff only)
router.post(
  '/:id/response',
  authorize('admin', 'staff'),
  complaintController.addResponse
);

// Submit feedback (student only)
router.post(
  '/:id/feedback',
  authorize('student'),
  complaintController.submitFeedback
);

module.exports = router;