const { Schema, model, Types } = require("mongoose");

const collectionSchema = new Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      default: null,
    },
    mobile: {
      type: Number,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    token: {
      type: {
        type: String,
        enum: ["Access", "Denied"],
      },
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
    forgotPassword: {
      createdAt: {
        type: Date,
        default: null,
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginType: {
      type: String,
      default: "Web",
      enum: ["Apple", "Google", "Web"],
    },
    appleId: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("user", collectionSchema);
