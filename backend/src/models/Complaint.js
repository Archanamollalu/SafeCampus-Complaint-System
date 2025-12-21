const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  response: {
    type: String,
    required: [true, 'Response text is required'],
    minlength: [10, 'Response must be at least 10 characters']
  },

  attachment: {
    type: String,
    default: ''
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'ragging-physical',
      'ragging-verbal',
      'ragging-sexual',
      'ragging-cyber',
      'ragging-group',
      'ragging-other'
    ]
  },

 

  // 🔥 **ML Model predicted severity**
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },

    // Anonymous complaint option
  isAnonymous: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  department: {
    type: String,
    required: [true, 'Department is required']
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  evidence: [{
    filename: String,
    originalname: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],

  responses: [responseSchema],

  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'both', 'none'],
    default: 'email'
  },

  blockchainHash: {
    type: String,
    default: ''
  },

  blockchainTxId: {
    type: String,
    default: ''
  },

  resolvedAt: Date,

  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update timestamp before update
complaintSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Virtuals
complaintSchema.virtual('statusDisplay').get(function() {
  const map = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  };
  return map[this.status] || this.status;
});

complaintSchema.virtual('categoryDisplay').get(function() {
  const map = {
    academic: 'Academic',
    administrative: 'Administrative',
    infrastructure: 'Infrastructure',
    faculty: 'Faculty',
    financial: 'Financial',
    hostel: 'Hostel',
    library: 'Library',
    sports: 'Sports',
    other: 'Other'
  };
  return map[this.category] || this.category;
});

// Indexes (Performance)
complaintSchema.index({ student: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ severity: 1 });  // 🔥 added for filtering by ML severity
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({
  student: 1,
  status: 1,
  createdAt: -1
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;