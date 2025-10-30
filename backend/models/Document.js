import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClearanceRequest',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['hod', 'medical', 'library', 'faculty', 'bursary', 'hostel', 'alumni', 'registrar']
  },
  file_url: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  original_name: {
    type: String,
    required: true
  },
  file_size: Number,
  mime_type: String
}, {
  timestamps: true
});

export default mongoose.model('Document', documentSchema);