import connectMongo from "@/lib/mongodb";
import User from "@/models/Candidate";

export async function GET() {
  try {
    await connectMongo();

    // Profession wise user count
    const professionData = await User.aggregate([
      {
        $group: {
          _id: "$profession",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          profession: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return new Response(
      JSON.stringify({ professions: professionData }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch professions", details: error }),
      { status: 500 }
    );
  }
}
