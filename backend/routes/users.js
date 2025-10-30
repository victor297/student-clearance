import express from 'express';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get officers by department
router.get('/officers/:department', authenticateToken, async (req, res) => {
  try {
    const { department } = req.params;
    
    const officers = await User.find({ 
      role: 'officer', 
      officer_department: department 
    }).select('-password');

    res.json(officers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user eligibility (Admin/Officer only)
router.patch('/:id/eligibility', authenticateToken, authorizeRoles('admin', 'officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_eligible } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { is_eligible },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User eligibility updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, officer_department } = req.body;

    const updateData = { role };
    if (role === 'officer' && officer_department) {
      updateData.officer_department = officer_department;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;