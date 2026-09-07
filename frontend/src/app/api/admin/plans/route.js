// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Plan from "@/models/Plan";

// // ✅ GET: To get all plans
// export async function GET() {
//   try {
//     await connectMongo();
//     // Sort by displayOrder, if not available then by price (Price Ascending)
//     const plans = await Plan.find({}).sort({ displayOrder: 1, price: 1 });
//     return NextResponse.json({ success: true, plans });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // ✅ POST: To create a new plan
// export async function POST(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();

//     // Basic validation
//     if (!body.title || !body.price || !body.userType) {
//       return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
//     }

//     const newPlan = await Plan.create(body);
//     return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // ✅ DELETE: To delete a plan (Newly added)
// export async function DELETE(req) {
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ success: false, error: "Plan ID is required" }, { status: 400 });
//     }

//     await Plan.findByIdAndDelete(id);
//     return NextResponse.json({ success: true, message: "Plan deleted successfully" });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await connectMongo();
    const plans = await Plan.find({}).sort({ price: 1 });
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const newPlan = await Plan.create(body);
    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { id, ...updateData } = body;
    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    await connectMongo();
    await Plan.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}