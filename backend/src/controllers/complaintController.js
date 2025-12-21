const Complaint = require('../models/Complaint');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Create complaint
exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      department,
      contactPreference,
      isAnonymous
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !department) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // ==============================
    // 1️⃣ CALL PYTHON ML SEVERITY MODEL
    // ==============================
    const axios = require("axios");
    let severity = "low"; // default fallback

    try {
      const aiResponse = await axios.post("http://127.0.0.1:5001/predict", {
        text: description
      });

     severity = aiResponse.data.severity; // ✅ DIRECTLY USE STRING

    } catch (err) {
      console.error("⚠️ AI Model Error:", err.message);
    }

    console.log("🤖 FINAL AI Severity Saved:", severity);

    // ==============================
    // 2️⃣ CREATE THE COMPLAINT WITH CORRECT FIELD
    // ==============================
    const complaint = await Complaint.create({
      title,
      description,
      category,
      severity,  // <-- IMPORTANT: Correct field
      department,
      contactPreference: contactPreference || "email",
      isAnonymous: isAnonymous || false,
      student: req.user.userId,
      status: "pending"
    });
    

    // ==============================
    // 3️⃣ HANDLE FILE UPLOADS
    // ==============================
    if (req.files && req.files.length > 0) {
      complaint.evidence = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));

      await complaint.save();
    }

    // ==============================
    // 4️⃣ SEND RESPONSE BACK
    // ==============================
    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      severity: severity,
      data: complaint
    });

  } catch (error) {
    next(error);
  }
};



// Get all complaints (with filters)
exports.getAllComplaints = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // For /my endpoint, filter by student
    if (req.user.role === 'student') {
      filter.student = req.user.userId;
    }
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department) filter.department = department;

    console.log('🔍 Fetching complaints with filter:', filter, 'User:', req.user.userId);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const complaints = await Complaint.find(filter)
      .populate('student', 'name email studentId department')
      .populate('assignedTo', 'name email role')
      .populate('responses.responder', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log('✅ Found', complaints.length, 'complaints out of', total, 'total');

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single complaint
exports.getComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID',
      });
    }

    // 1️⃣ FETCH complaint WITH student populated
    const complaint = await Complaint.findById(id)
      .populate('student', 'name email studentId department phone')
      .populate('assignedTo', 'name email role department')
      .populate('responses.responder', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // 2️⃣ PERMISSION CHECK (IMPORTANT: BEFORE hiding data)
    if (req.user.role === 'student') {
      // student can view only their own complaint
      if (complaint.student._id.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // 3️⃣ CREATE RESPONSE COPY (do NOT mutate original)
    const responseComplaint = complaint.toObject();

    // 4️⃣ HIDE STUDENT DETAILS IF ANONYMOUS
    if (responseComplaint.isAnonymous) {
      responseComplaint.student = {
        name: 'Anonymous',
      };
    }

    // 5️⃣ SEND RESPONSE
    res.json({
      success: true,
      data: responseComplaint,
    });

  } catch (error) {
    next(error);
  }
};

// Update complaint
exports.updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, department } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Find complaint
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions (only student who created it can update if pending)
    if (req.user.role === 'student') {
      if (complaint.student.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Student can only update if status is pending
      if (complaint.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update complaint once it\'s being processed'
        });
      }
    }

    // Update fields
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;
    if (department) complaint.department = department;

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student' && complaint.student.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated files
    if (complaint.evidence && complaint.evidence.length > 0) {
      for (const file of complaint.evidence) {
        try {
          await fs.unlink(path.join(__dirname, '../..', file.path));
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    await complaint.deleteOne();

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update complaint status (admin/staff only)
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check permissions (admin/staff only)
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin/staff only.'
      });
    }

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update status
    complaint.status = status;
    
    // Set resolvedAt if status is resolved
    if (status === 'resolved') {
      complaint.resolvedAt = Date.now();
    }

    // Auto-assign if in progress and not assigned
    if (status === 'in-progress' && !complaint.assignedTo) {
      complaint.assignedTo = req.user.userId;
    }

    await complaint.save();

    res.json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Add response to complaint
exports.addResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Validate response
    if (!response || response.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Response must be at least 10 characters'
      });
    }

    // Check permissions (admin/staff only)
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin/staff only.'
      });
    }

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add response
    complaint.responses.push({
      responder: req.user.userId,
      response: response.trim()
    });

    // Update status to in-progress if it's the first response
    if (complaint.status === 'pending') {
      complaint.status = 'in-progress';
      complaint.assignedTo = req.user.userId;
    }

    await complaint.save();

    // Populate responder info
    const updatedComplaint = await Complaint.findById(id)
      .populate('responses.responder', 'name email role');

    res.json({
      success: true,
      message: 'Response added successfully',
      data: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

// Submit feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions (only student who created it can give feedback)
    if (complaint.student.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if complaint is resolved
    if (complaint.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for resolved complaints'
      });
    }

    // Submit feedback
    complaint.feedback = {
      rating,
      comment: comment || '',
      submittedAt: Date.now()
    };

    await complaint.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: complaint.feedback
    });
  } catch (error) {
    next(error);
  }
};

// Get complaint statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let filter = {};
    if (role === 'student') {
      filter.student = userId;
    }

    // Get counts by status
    const statusCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by category
    const categoryCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get counts by priority
    const priorityCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get total count
    const total = await Complaint.countDocuments(filter);

    // Get pending complaints
    const pending = await Complaint.countDocuments({ ...filter, status: 'pending' });

    // Get resolved complaints
    const resolved = await Complaint.countDocuments({ ...filter, status: 'resolved' });

    // Get in-progress complaints
    const inProgress = await Complaint.countDocuments({ ...filter, status: 'in-progress' });

    // Get rejected complaints
    const rejected = await Complaint.countDocuments({ ...filter, status: 'rejected' });

    // Format statistics
    const statistics = {
      total,
      pending,
      resolved,
      inProgress,
      rejected,
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byCategory: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPriority: priorityCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};