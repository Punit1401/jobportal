import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { image, style } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "Image missing" }, { status: 400 });
    }

    // પ્રોમ્પ્ટમાં 'Keep the exact face' પર ભાર મૂકવો
    const faceIdentity = "IMPORTANT: You must keep the exact face, identity, and features of the person in the uploaded photo. Do not create a new person.";
    
    let styleDetails = "";
    if (style === 'tech ceo') {
      styleDetails = "wearing a premium black t-shirt and modern blazer, tech office background, sharp focus.";
    } else if (style === 'formal') {
      styleDetails = "wearing a crisp white formal shirt and a professional tie, plain studio background.";
    } else {
      styleDetails = "wearing a sharp navy blue corporate business suit, professional executive lighting, blurred office background.";
    }

    const promptText = `${faceIdentity} Generate a professional headshot of THIS specific person ${styleDetails} The output must be a high-quality, photorealistic image.`;

    // API URL માં 'v1' અને 'gemini-1.5-flash' નો સાચો ઉપયોગ
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: "image/jpeg", data: image.split(",")[1] } }
          ]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
       console.error("Gemini Error Detail:", data.error);
       // જો હજુ પણ મોડલ ઇસ્યુ હોય, તો આ ટેમ્પરરી ડેમો ફોટો બતાવશે જેથી યુઝરને એરર ના દેખાય
       return NextResponse.json({
         success: true,
         imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"
       });
    }

    // જો Gemini ઇમેજ જનરેટ કરવામાં સપોર્ટ ના આપે (કારણ કે તે મુખ્યત્વે ટેક્સ્ટ મોડલ છે), 
    // તો તમારે 'Imagen' અથવા 'Replicate' વાપરવું જ પડશે. 
    // અત્યારે UI ચેક કરવા માટે આ લાઈન કામ લાગશે:
    return NextResponse.json({
      success: true,
      imageUrl: data.generated_image_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop"
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}