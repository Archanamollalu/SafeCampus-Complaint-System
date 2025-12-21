const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Complaint = require('../models/Complaint');

router.get('/', protect, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    // Return mock analytics data for now
    const analytics = {
      dailyStats: generateDailyStats(),
      categoryDistribution: await getCategoryDistribution(),
      resolutionTimes: await getResolutionTimes(),
      satisfactionRatings: await getSatisfactionRatings(),
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
const generateDailyStats = () => {
  const stats = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    stats.push({
      date: date.toISOString().split('T')[0],
      complaints: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 3,
      pending: Math.floor(Math.random() * 10) + 2,
    });
  }
  return stats;
};

const getCategoryDistribution = async () => {
  const distribution = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return distribution;
};

const getResolutionTimes = async () => {
  const times = await Complaint.aggregate([
    { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
    {
      $addFields: {
        resolutionHours: {
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
        average: { $avg: '$resolutionHours' },
        min: { $min: '$resolutionHours' },
        max: { $max: '$resolutionHours' }
      }
    }
  ]);
  return times[0] || { average: 0, min: 0, max: 0 };
};

const getSatisfactionRatings = async () => {
  const ratings = await Complaint.aggregate([
    { $match: { 'feedback.rating': { $exists: true } } },
    {
      $group: {
        _id: '$feedback.rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  return ratings;
};

module.exports = router;