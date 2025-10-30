import express from "express";
import multer from "multer";
import path from "path";
import XLSX from "xlsx";
import User from "../models/User.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.fieldname === "excel") {
      if (
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-excel"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only Excel files are allowed"));
      }
    } else {
      // For document uploads
      const allowedTypes = /jpeg|jpg|png|pdf/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
      }
    }
  },
});

// Bulk upload students via Excel (Admin only)
router.post(
  "/students",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("excel"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
      }

      // Read Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        success: 0,
        errors: [],
        duplicates: 0,
      };

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];

        try {
          // Validate required fields
          if (
            !row.StudentID ||
            !row.FirstName ||
            !row.LastName ||
            !row.Email ||
            !row.Department
          ) {
            results.errors.push(`Row ${i + 2}: Missing required fields`);
            continue;
          }

          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [{ email: row.Email }, { student_id: row.StudentID }],
          });

          if (existingUser) {
            results.duplicates++;
            continue;
          }

          // Create new user with lastname as default password
          const user = new User({
            firstname: row.FirstName,
            lastname: row.LastName,
            email: row.Email,
            password: row.LastName.toLowerCase(), // Default password is surname
            department: row.Department,
            role: "student",
            student_id: row.StudentID,
            cgpa: row.CGPA || 0,
            is_eligible: true, // Default eligible status
          });

          await user.save();
          results.success++;
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      res.json({
        message: "Bulk upload completed",
        results,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Upload eligible students list (Officer only)
router.post(
  "/eligible",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  upload.single("excel"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
      }

      // Read Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        success: 0,
        errors: [],
        notFound: 0,
      };

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];

        try {
          // Find user by StudentID or Email
          const user = await User.findOne({
            $or: [{ student_id: row.StudentID }, { email: row.Email }],
          });

          if (!user) {
            results.notFound++;
            results.errors.push(`Row ${i + 2}: Student not found`);
            continue;
          }

          // Update eligibility
          user.is_eligible = true;
          await user.save();
          results.success++;
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      res.json({
        message: "Eligibility update completed",
        results,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Upload documents (Students only)
router.post(
  "/documents",
  authenticateToken,
  upload.array("documents", 10),
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res
          .status(403)
          .json({ message: "Only students can upload documents" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const { request_id, department } = req.body;

      if (!request_id || !department) {
        return res
          .status(400)
          .json({ message: "Request ID and department are required" });
      }

      // Verify the request belongs to the student and allow uploads for pending or rejected requests
      const ClearanceRequest = (await import("../models/ClearanceRequest.js"))
        .default;
      const request = await ClearanceRequest.findOne({
        _id: request_id,
        student_id: req.user._id,
        overall_status: { $in: ["pending", "rejected"] },
      });

      if (!request) {
        return res
          .status(403)
          .json({ message: "Cannot upload documents for this request" });
      }

      // Import Document model
      const Document = (await import("../models/Document.js")).default;

      const savedDocuments = [];

      for (const file of req.files) {
        const document = new Document({
          request_id,
          student_id: req.user._id,
          department,
          file_url: `/uploads/${file.filename}`,
          file_name: file.filename,
          original_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype,
        });

        const savedDoc = await document.save();
        savedDocuments.push(savedDoc);
      }

      // If request was rejected and student uploads new documents, reset the department status to pending
      if (request.overall_status === "rejected") {
        // If this was the department that caused rejection, reset overall status to pending
        const rejectedDepts = Object.keys(request.departments).filter(
          (dept) => request.departments[dept].status === "rejected"
        );

        // Reset the specific department status to pending if documents are uploaded for it
        if (request.departments[department]) {
          request.departments[department].status = "pending";
          request.departments[department].comments =
            "New documents uploaded - pending review";
          request.departments[department].timestamp = new Date();
        }

        if (rejectedDepts.includes(department)) {
          request.overall_status = "pending";
          request.current_stage = department;
        }
        console.log(request);
        await request.save();

        // Notify the relevant officer about new documents
        const User = (await import("../models/User.js")).default;
        const Notification = (await import("../models/Notification.js"))
          .default;

        const officers = await User.find({
          role: "officer",
          officer_department: department,
        });

        for (const officer of officers) {
          const notification = new Notification({
            user_id: officer._id,
            message: `${req.user.firstname} ${req.user.lastname} has uploaded new documents for review`,
            type: "new_request",
            related_request: request_id,
          });
          await notification.save();
        }
      }

      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));

      res.json({
        message: "Documents uploaded successfully",
        files: uploadedFiles,
        documents: savedDocuments,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get documents for a request
router.get("/documents/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { department } = req.query;

    const Document = (await import("../models/Document.js")).default;

    let filter = { request_id: requestId };

    // If user is an officer, only show documents for their department
    if (req.user.role === "officer" && department) {
      filter.department = department;
    }

    const documents = await Document.find(filter)
      .populate("student_id", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get documents by department for officers
router.get(
  "/documents/department/:department",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "officer" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { department } = req.params;
      const Document = (await import("../models/Document.js")).default;

      const documents = await Document.find({ department })
        .populate("student_id", "firstname lastname email")
        .populate("request_id", "overall_status current_stage")
        .sort({ createdAt: -1 });

      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
