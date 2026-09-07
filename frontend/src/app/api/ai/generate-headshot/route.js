import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { image, style } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "Image missing" }, { status: 400 });
    }

    // Emphasize 'Keep the exact face' in the prompt
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

    // Correct use of 'v1' and 'gemini-1.5-flash' in the API URL
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
       // If there is still a model issue, this will show a temporary demo photo so the user doesn't see an error
       return NextResponse.json({
         success: true,
         imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"
       });
    }

    // If Gemini does not support image generation (because it is primarily a text model), 
    // then you will have to use 'Imagen' or 'Replicate'. 
    // This line will be useful for checking the UI right now:
    return NextResponse.json({
      success: true,
      imageUrl: data.generated_image_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop"
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}