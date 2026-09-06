const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    userRole: {
      type: String,
      enum: {
        values: ["admin", "client", "customer"],
        message: "Role must be admin, client, or customer",
      },
      default: "customer",
    },
    userStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);
userSchema.pre("save", async function(next) {
  if (!this.isModified(password)) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (currentPassword) {
  return await bcrypt.compare(currentPassword, this.password);
};

userSchema.methods.createJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.userRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.expiry || "7d" },
  );
};

userSchema.methods.isSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    userRole: this.userRole,
    userStatus: this.userStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = new mongoose.Model("user", userSchema);
module.exports = {
  User,
};
