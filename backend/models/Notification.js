import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['clearance_status', 'new_request', 'approval_required'],
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  related_request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClearanceRequest'
  }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);