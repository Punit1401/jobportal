import mongoose from "mongoose";

const StorageSettingsSchema = new mongoose.Schema(
  {
    defaultCandidateSpaceMB: { type: Number, default: 200 },
    defaultRecruiterSpaceMB: { type: Number, default: 500 },
    defaultServiceProviderSpaceMB: { type: Number, default: 500 },
  },
  { timestamps: true }
);

if (mongoose.models.StorageSettings) {
  delete mongoose.models.StorageSettings;
}

export default mongoose.model("StorageSettings", StorageSettingsSchema);
