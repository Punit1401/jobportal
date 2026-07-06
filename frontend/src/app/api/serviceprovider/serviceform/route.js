import connectMongo from "@/lib/mongodb";
import ServiceForm from "@/models/serviceform";
import Review from "@/models/Review"; // Review મોડેલ ઈમ્પોર્ટ કરો
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const newService = await ServiceForm.create({
      title: body.title,
      category: body.category,
      price: Number(body.price),
      description: body.description,
      providerName: body.providerName,
      providerMobile: body.providerMobile,
      providerEmail: session.user.email,
      whatsappNumber: body.whatsappNumber,
    });

    return NextResponse.json({ success: true, data: newService });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedService = await ServiceForm.findOneAndUpdate(
      { _id: id, providerEmail: session.user.email },
      { 
        $set: {
          title: updateData.title,
          category: updateData.category,
          price: Number(updateData.price),
          description: updateData.description,
          whatsappNumber: updateData.whatsappNumber,
          providerMobile: updateData.providerMobile,
          providerName: updateData.providerName
        } 
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedService });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    // --- જો બધી સર્વિસ જોઈતી હોય (With Ratings) ---
    if (searchParams.get("all") === "true") {
      const services = await ServiceForm.aggregate([
        {
          $lookup: {
            from: "reviews", // MongoDB માં કલેક્શનનું નામ (Review મોડેલ મુજબ)
            localField: "providerEmail", // પ્રોવાઈડરના ઈમેલ થી મેચ કરો
            foreignField: "targetId", 
            as: "ratings"
          }
        },
        {
          $addFields: {
            averageRating: { $avg: "$ratings.rating" },
            reviewCount: { $size: "$ratings" }
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return NextResponse.json({ success: true, services });
    }

    // --- પ્રોવાઈડર પોતાની સર્વિસ જોવા માંગતો હોય ત્યારે ---
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const services = await ServiceForm.find({ providerEmail: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, services });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const id = new URL(req.url).searchParams.get("id");
    if (!session || !id) return NextResponse.json({ success: false, error: "Invalid Request" }, { status: 400 });

    await ServiceForm.findOneAndDelete({ _id: id, providerEmail: session.user.email });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}