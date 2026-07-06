import mongoose from "mongoose";

// કેશ ક્લિયર કરવાની ટ્રિક
if (mongoose.connection && mongoose.models.Dropdown) {
  delete mongoose.models.Dropdown;
}

const DropdownSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      // enum કાઢીને ડાયનેમિક ચેક મૂક્યો છે જેથી એરર ન આવે
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Dropdown = mongoose.models.Dropdown || mongoose.model("Dropdown", DropdownSchema);
export default Dropdown;