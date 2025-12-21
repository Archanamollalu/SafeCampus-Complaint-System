const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    
    const updateFields = {};
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (department) updateFields.department = department;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get admin statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalActiveComplaints = await Complaint.countDocuments({ status: { $in: ['pending', 'in-progress'] } });
    const totalResolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

    // Get complaints by department
    const complaintsByDepartment = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top categories
    const topCategories = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get average resolution time
    const resolutionStats = await Complaint.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $addFields: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' }
        }
      }
    ]);

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          complaints: totalComplaints,
          activeComplaints: totalActiveComplaints,
          resolvedComplaints: totalResolvedComplaints
        },
        byDepartment: complaintsByDepartment,
        topCategories,
        resolutionStats: resolutionStats[0] || null,
        recentComplaints
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;