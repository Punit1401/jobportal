import { NextResponse } from "next/server";

// AI Professional Headshots — transforms an uploaded casual photo into a
// corporate headshot using Stability AI image-to-image (real generation).
// Lower strength preserves more of the person's face.
const STYLES = {
  corporate: "wearing a sharp navy-blue business suit and tie, executive corporate headshot, professional studio lighting",
  formal: "wearing a crisp white formal shirt and dark tie, clean professional studio headshot",
  techceo: "wearing a premium black t-shirt under a modern blazer, confident tech-founder look",
  businesscasual: "wearing a smart business-casual blazer over a collared shirt, approachable professional look",
  doctor: "wearing a white medical coat, professional healthcare headshot",
};
const BACKGROUNDS = {
  studio: "plain neutral grey studio backdrop",
  office: "softly blurred modern office background",
  gradient: "subtle blue corporate gradient background",
  outdoor: "softly blurred outdoor city background with bokeh",
};

function buildPrompt(style, background) {
  return (
    `Professional corporate headshot of this exact person, keeping their real face and identity, ` +
    `${STYLES[style] || STYLES.corporate}, ${BACKGROUNDS[background] || BACKGROUNDS.studio}, ` +
    `photorealistic, high detail, sharp focus, head and shoulders.`
  );
}

// --- OpenAI gpt-image-1 image edit (preferred — better face fidelity) ---
async function generateOpenAI(bytes, prompt) {
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image", new Blob([bytes], { type: "image/png" }), "photo.png");
  form.append("prompt", prompt);
  form.append("size", "1024x1024");
  form.append("n", "1");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `OpenAI ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image");
  return `data:image/png;base64,${b64}`;
}

// --- Stability image-to-image (fallback) ---
async function generateStability(bytes, prompt, strength) {
  const form = new FormData();
  form.append("image", new Blob([bytes]), "photo.png");
  form.append("prompt", prompt);
  form.append("mode", "image-to-image");
  form.append("strength", String(strength));
  form.append("output_format", "png");
  form.append("style_preset", "photographic");
  form.append("negative_prompt", "cartoon, distorted face, deformed, extra limbs, watermark, text, low quality");

  const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STABILITY_API_KEY}`, Accept: "application/json" },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(txt.slice(0, 120));
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  if (!data.image) throw new Error("Stability returned no image");
  return `data:image/png;base64,${data.image}`;
}

export async function POST(req) {
  try {
    const { image, style = "corporate", background = "studio", strength = 0.45, provider } = await req.json();
    if (!image) return NextResponse.json({ success: false, error: "No photo provided" }, { status: 400 });

    const base64 = image.includes(",") ? image.split(",")[1] : image;
    const bytes = Buffer.from(base64, "base64");
    const prompt = buildPrompt(style, background);

    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasStability = !!process.env.STABILITY_API_KEY;
    if (!hasOpenAI && !hasStability) {
      return NextResponse.json({ success: false, error: "Image AI is not configured." }, { status: 503 });
    }

    // Order: explicit provider → OpenAI (preferred) → Stability fallback.
    const order = provider === "stability"
      ? ["stability", "openai"]
      : ["openai", "stability"];

    let lastError = "";
    for (const p of order) {
      try {
        if (p === "openai" && hasOpenAI) {
          const url = await generateOpenAI(bytes, prompt);
          return NextResponse.json({ success: true, imageUrl: url, style, background, provider: "openai" });
        }
        if (p === "stability" && hasStability) {
          const url = await generateStability(bytes, prompt, strength);
          return NextResponse.json({ success: true, imageUrl: url, style, background, provider: "stability" });
        }
      } catch (e) {
        lastError = e.message || "generation error";
        if (e.status === 402) {
          // out of credits/quota — try the next provider rather than failing
          continue;
        }
        // for other errors, also fall through to the next provider
      }
    }

    const noCredits = /quota|credit|billing|402/i.test(lastError);
    return NextResponse.json(
      { success: false, code: noCredits ? "NO_CREDITS" : undefined, error: lastError || "Generation failed." },
      { status: noCredits ? 402 : 502 }
    );
  } catch (error) {
    console.error("Headshot Error:", error);
    return NextResponse.json({ success: false, error: "Headshot generation failed." }, { status: 500 });
  }
}
