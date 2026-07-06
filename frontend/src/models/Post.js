import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  // અહીં ફેરફાર કરો: ObjectId ને બદલે String રાખો
  userId: { 
    type: String, 
    required: true 
  }, 
  userName: { type: String },
  userImage: { type: String },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  likes: { type: Array, default: [] }
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
export default Post;