import mongoose from "mongoose";

const UserFileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    size: {
      type: Number,
      default: 0, // In bytes
    },
    url: {
      type: String, // Local path e.g., /uploads/user_files/xyz.pdf
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserFile",
      default: null, // null means root level
    },
    mimetype: {
      type: String,
    },
  },
  { timestamps: true }
);

if (mongoose.models.UserFile) {
  delete mongoose.models.UserFile;
}

export default mongoose.model("UserFile", UserFileSchema);
