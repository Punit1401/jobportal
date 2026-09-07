import { NextResponse } from "next/server";
import crypto from "crypto";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import Plan from "@/models/Plan"; // ૧. Plan મોડેલ ઈમ્પોર્ટ કરો
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    // ૧. Signature Verify (તમારો જૂનો કોડ)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await connectMongo();

      // ૨. પ્લાનની વિગતો મેળવો (કેટલા દિવસની વેલિડિટી છે તે જાણવા માટે)
      const selectedPlan = await Plan.findById(planId);
      if (!selectedPlan) {
        return NextResponse.json({ error: "Selected plan not found" }, { status: 404 });
      }

      // ૩. Expiry Date ગણતરી કરો
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + selectedPlan.duration);

      const Model = session.user.role === "serviceprovider" ? ServiceProvider : Recruiter;

      // ૪. યુઝર પ્રોફાઈલમાં સબ્સ્ક્રિપ્શન ડેટા અપડેટ કરો
      const updatedUser = await Model.findOneAndUpdate(
        { email: session.user.email },
        {
          isPaid: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paidAt: new Date(),
          status: "approved",
          // --- સબ્સ્ક્રિપ્શન ડેટા અહીં સેટ થશે ---
          subscription: {
            planId: selectedPlan._id,
            status: "Active",
            expiryDate: expiryDate,
            usedJobs: 0, // નવો પ્લાન એટલે વપરાશ ઝીરો કરી દેવો
            usedLeads: 0
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Subscription activated successfully!" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}