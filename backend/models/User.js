import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
    },
    department: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "officer", "admin"],
      default: "student",
    },
    officer_department: {
      type: String,
      enum: [
        "hod",
        "medical",
        "library",
        "faculty",
        "bursary",
        "hostel",
        "alumni",
        "registrar",
      ],
      required: function () {
        return this.role === "officer";
      },
    },
    is_eligible: {
      type: Boolean,
      default: false,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 5,
    },
    student_id: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
