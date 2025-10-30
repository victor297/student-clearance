import express from 'express';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const departments = await Department.find({ is_active: true })
      .populate('officers', 'firstname lastname email officer_department')
      .sort({ dept_name: 1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create department (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { dept_name, description } = req.body;

    const existingDept = await Department.findOne({ dept_name });
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = new Department({
      dept_name,
      description
    });

    await department.save();

    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add officer to department (Admin only)
router.post('/:id/officers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const officer = await User.findById(officer_id);
    if (!officer || officer.role !== 'officer') {
      return res.status(400).json({ message: 'Invalid officer' });
    }

    if (!department.officers.includes(officer_id)) {
      department.officers.push(officer_id);
      await department.save();
    }

    const updatedDept = await Department.findById(id)
      .populate('officers', 'firstname lastname email officer_department');

    res.json({ message: 'Officer added to department', department: updatedDept });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove officer from department (Admin only)
router.delete('/:id/officers/:officerId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id, officerId } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { $pull: { officers: officerId } },
      { new: true }
    ).populate('officers', 'firstname lastname email officer_department');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Officer removed from department', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;