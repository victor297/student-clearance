import express from "express";
import ClearanceRequest from "../models/ClearanceRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { authenticateToken, authorizeOfficer } from "../middleware/auth.js";
import {
  sendClearanceCertificate,
  sendNotificationEmail,
} from "../services/emailService.js";

const router = express.Router();

// Create clearance request (Students only)
router.post("/request", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can create clearance requests" });
    }

    if (!req.user.is_eligible) {
      return res
        .status(403)
        .json({ message: "You are not eligible for clearance" });
    }

    // Check if student already has a pending request (allow new requests if previous was rejected)
    const existingRequest = await ClearanceRequest.findOne({
      student_id: req.user._id,
      overall_status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending clearance request" });
    }

    const clearanceRequest = new ClearanceRequest({
      student_id: req.user._id,
      reason: req.body.reason,
    });

    await clearanceRequest.save();

    // Notify HOD
    const hodOfficers = await User.find({
      role: "officer",
      officer_department: "hod",
    });

    for (const hod of hodOfficers) {
      const notification = new Notification({
        user_id: hod._id,
        message: `New clearance request from ${req.user.firstname} ${req.user.lastname}`,
        type: "new_request",
        related_request: clearanceRequest._id,
      });
      await notification.save();

      // Send email notification
      await sendNotificationEmail(
        hod.email,
        "New Clearance Request",
        `A new clearance request has been submitted by ${req.user.firstname} ${req.user.lastname}.`
      );
    }

    res.status(201).json({
      message: "Clearance request submitted successfully",
      request: clearanceRequest,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get clearance requests for student
router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can view their requests" });
    }

    const requests = await ClearanceRequest.find({ student_id: req.user._id })
      .populate("student_id", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get pending requests for officer
router.get(
  "/pending",
  authenticateToken,
  authorizeOfficer,
  async (req, res) => {
    try {
      const officerDept = req.user.officer_department;

      const filter = {};
      filter[`departments.${officerDept}.status`] = "pending";
      filter.current_stage = officerDept;

      const requests = await ClearanceRequest.find(filter)
        .populate(
          "student_id",
          "firstname lastname email department student_id"
        )
        .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update clearance request status (Officers only)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeOfficer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;
      const officerDept = req.user.officer_department;

      const request = await ClearanceRequest.findById(id).populate(
        "student_id",
        "firstname lastname email"
      );

      if (!request) {
        return res.status(404).json({ message: "Clearance request not found" });
      }

      // Update the specific department status
      request.departments[officerDept] = {
        status,
        officer_id: req.user._id,
        comments,
        timestamp: new Date(),
      };

      // Define the sequence of departments
      const sequence = [
        "hod",
        "bursary",
        "medical",
        "library",
        "faculty",
        "hostel",
        "alumni",
        "registrar",
      ];
      const currentIndex = sequence.indexOf(officerDept);

      if (status === "rejected") {
        request.overall_status = "rejected";
        request.current_stage = "completed";
        request.completed_at = new Date();
      } else if (status === "approved") {
        const nextIndex = currentIndex + 1;

        if (nextIndex < sequence.length) {
          // Move to next department
          request.current_stage = sequence[nextIndex];

          // Notify next department officers
          const nextDept = sequence[nextIndex];
          const nextOfficers = await User.find({
            role: "officer",
            officer_department: nextDept,
          });

          for (const officer of nextOfficers) {
            const notification = new Notification({
              user_id: officer._id,
              message: `Clearance request from ${request.student_id.firstname} ${request.student_id.lastname} requires your approval`,
              type: "approval_required",
              related_request: request._id,
            });
            await notification.save();

            await sendNotificationEmail(
              officer.email,
              "Clearance Approval Required",
              `A clearance request requires your approval in the ${nextDept} department.`
            );
          }
        } else {
          // All departments approved
          request.overall_status = "approved";
          request.current_stage = "completed";
          request.completed_at = new Date();

          // Notify student of completion
          const studentNotification = new Notification({
            user_id: request.student_id._id,
            message: "Your clearance request has been fully approved!",
            type: "clearance_status",
            related_request: request._id,
          });
          await studentNotification.save();

          // await sendNotificationEmail(
          //   request.student_id.email,
          //   "Clearance Approved",
          //   "Congratulations! Your clearance request has been fully approved."
          // );

          await sendClearanceCertificate(
            request.student_id.email,
            request.student_id.firstname + " " + request.student_id.lastname
          );
        }
      }

      await request.save();

      // Notify student of status change
      const studentNotification = new Notification({
        user_id: request.student_id._id,
        message: `Your clearance request has been ${status} by ${officerDept} department`,
        type: "clearance_status",
        related_request: request._id,
      });
      await studentNotification.save();

      res.json({ message: "Request status updated successfully", request });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get all clearance requests (Admin only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, department } = req.query;
    const filter = {};

    if (status) filter.overall_status = status;

    const requests = await ClearanceRequest.find(filter)
      .populate("student_id", "firstname lastname email department student_id")
      .sort({ createdAt: -1 });

    // Filter by student department if specified
    const filteredRequests = department
      ? requests.filter((req) => req.student_id.department === department)
      : requests;

    res.json(filteredRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
