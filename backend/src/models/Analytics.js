const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  totalComplaints: {
    type: Number,
    default: 0
  },
  
  complaintsByCategory: {
    academic: { type: Number, default: 0 },
    administrative: { type: Number, default: 0 },
    infrastructure: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 },
    financial: { type: Number, default: 0 },
    hostel: { type: Number, default: 0 },
    library: { type: Number, default: 0 },
    sports: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  complaintsByStatus: {
    pending: { type: Number, default: 0 },
    'in-progress': { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  },
  
  complaintsByPriority: {
    low: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    urgent: { type: Number, default: 0 }
  },
  
  averageResolutionTime: {
    type: Number, // in hours
    default: 0
  },
  
  studentSatisfaction: {
    type: Number, // average rating 1-5
    default: 0
  },
  
  activeUsers: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index
analyticsSchema.index({ date: 1 }, { unique: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;