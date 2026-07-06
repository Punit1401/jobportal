// //src/app/api/recruiter/company/setup/route.js
// export const runtime = "nodejs";
// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Company from "@/models/Company";

// export async function POST(req) {
//   try {
//     await connectMongo();

//     const body = await req.json();
//     const { 
//       name, 
//       tagline, 
//       industry, 
//       website, 
//       email, 
//       phone, 
//       address,
//       city,      // <--- Add this
//       state,     // <--- Add this
//       pincode,   // <--- Add this
//       country, 
//       companySize, 
//       founded,
//       location,
//       contactPersonName, 
//       contactPersonNumber, 
//       contactPersonEmail,
//       ownerName, 
//       ownerNumber, 
//       ownerEmail,
//       profession,
//       department,
//       description, 
//       specialties,
//       logo // લોગો પણ સેવ થશે
//     } = body;

//     // અહીં તમારી રજીસ્ટ્રેશન વાળી Recruiter/User ID આવશે
//     // અત્યારે TEMP છે, પણ તે રજીસ્ટર થયેલા ડેટાને જ શોધશે
//     const recruiterId = "TEMP_RECRUITER_ID"; 

//     // રજીસ્ટ્રેશન વખતે જે કંપની બની હોય તેને જ શોધીને અપડેટ કરશે
//     const updatedCompany = await Company.findOneAndUpdate(
//       { recruiterId: recruiterId },
//       {
//         name,
//         tagline,
//         industry,
//         website,
//         email,
//         phone,
//         location, 
//         address,
//         city,      // <--- Add this
//         state,     // <--- Add this
//         pincode,   // <--- Add this
//         country,
//         companySize,
//         founded,
//         profession,
//         department,
//         designation,
//         description,
//         specialties,
//         logo,
//         contactPersonName,
//         contactPersonNumber,
//         contactPersonEmail,
//         ownerName,
//         ownerNumber,
//         ownerEmail
//       },
//       { new: true } // અહીં upsert કાઢી નાખ્યું છે જેથી ફક્ત રજીસ્ટર થયેલી કંપની જ અપડેટ થાય
//     );

//     if (!updatedCompany) {
//       return NextResponse.json({ error: "Company not found. Please register first." }, { status: 404 });
//     }

//     return NextResponse.json({ 
//       ok: true, 
//       message: "Profile updated successfully", 
//       data: updatedCompany 
//     });

//   } catch (err) {
//     console.error("COMPANY_SETUP_ERROR:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function GET(req) {
//   try {
//     await connectMongo();
//     const recruiterId = "TEMP_RECRUITER_ID"; 

//     const company = await Company.findOne({ recruiterId });
    
//     if (!company) {
//       return NextResponse.json({ data: null });
//     }

//     return NextResponse.json({ data: company });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
//src/app/api/recruiter/company/setup/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Company from "@/models/Company";

export async function POST(req) {
  try {
    await connectMongo();

    const body = await req.json();
    const { 
      name, 
      tagline, 
      industry, 
      website, 
      email, 
      phone, 
      address,
      city,      
      state,     
      pincode,   
      country, 
      companySize, 
      founded,
      location,
      contactPersonName, 
      contactPersonNumber, 
      contactPersonEmail,
      ownerName, 
      ownerNumber, 
      ownerEmail,
      profession,
      department,
      description, 
      specialties,
      logo 
    } = body;

    // અહીં filterEmail વાપરો jethi login user update thay
    const filterEmail = email; 

    const updatedCompany = await Company.findOneAndUpdate(
      { email: filterEmail }, // Email થી શોધો
      {
        name,
        tagline,
        industry,
        website,
        email,
        phone,
        location, 
        address,
        city,      
        state,     
        pincode,   
        country,
        companySize,
        founded,
        profession,
        department,
        description,
        specialties,
        logo,
        contactPersonName,
        contactPersonNumber,
        contactPersonEmail,
        ownerName,
        ownerNumber,
        ownerEmail
      },
      { new: true }
    );

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found. Please register first." }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Profile updated successfully", 
      data: updatedCompany 
    });

  } catch (err) {
    console.error("COMPANY_SETUP_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongo();
    
    // URL માંથી email મેળવો (Dynamic filtering)
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // હાર્ડકોડેડ ID ને બદલે ડાયનેમિક ઇમેઇલથી ડેટા શોધો
    const company = await Company.findOne({ email: email });
    
    if (!company) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: company });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}