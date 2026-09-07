import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["Pending", "In Progress", "Completed", "Cancelled"], 
      default: "Pending" 
    },
    priority: { 
      type: String, 
      enum: ["Low", "Medium", "High", "Urgent"], 
      default: "Medium" 
    },
    dueDate: { type: Date },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
