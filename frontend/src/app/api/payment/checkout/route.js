// import { NextResponse } from "next/server";
// import Razorpay from "razorpay";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { amount } = await req.json();

//     // Security: હમેશા અમાઉન્ટ સર્વર સાઇડ પર કન્ફર્મ કરો (અત્યારે 500 ફિક્સ રાખીએ)
//     const finalAmount = amount === 500 ? 500 : 500; 

//     const options = {
//       amount: finalAmount * 100, // પૈસામાં
//       currency: "INR",
//       receipt: `rcpt_${session.user.email.split('@')[0]}_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     return NextResponse.json({ success: true, order });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
//src/app/api/payment/checkout/route.js
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // Build time error rokva mate keys check karo
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay Keys missing in Environment Variables");
      return NextResponse.json({ success: false, error: "Payment Gateway Configuration Missing" }, { status: 500 });
    }

    // Razorpay ne function ni andar initialize karo
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, purpose = "wallet_topup" } = await req.json();

    const rupees = Number(amount);
    if (!rupees || rupees < 100 || rupees > 100000) {
      return NextResponse.json({ error: "Amount must be between ₹100 and ₹100000" }, { status: 400 });
    }

    const options = {
      amount: Math.round(rupees * 100),
      currency: "INR",
      receipt: `rcpt_${session.user.email.split("@")[0]}_${Date.now()}`,
      notes: { purpose, userId: session.user.id },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}