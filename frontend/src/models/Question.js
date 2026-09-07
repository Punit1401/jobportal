import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  providerEmail: { type: String, required: true },
  providerName: { type: String, required: true },
  answerText: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewComment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  questionText: { type: String, required: true },
  answers: [AnswerSchema]
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
export default Question;
