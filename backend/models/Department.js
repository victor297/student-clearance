import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  dept_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  officers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Department', departmentSchema);