import mongoose from 'mongoose';

const clearanceRequestSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departments: {
    hod: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    bursary: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    medical: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    library: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    faculty: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    hostel: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    alumni: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    },
    registrar: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      officer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String,
      timestamp: Date
    }
  },
  overall_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  current_stage: {
    type: String,
    enum: ['hod', 'bursary', 'medical', 'library', 'faculty', 'hostel', 'alumni', 'registrar', 'completed'],
    default: 'hod'
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  completed_at: Date,
  reason: String
}, {
  timestamps: true
});

export default mongoose.model('ClearanceRequest', clearanceRequestSchema);