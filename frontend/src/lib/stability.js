// src/lib/stability.js
import fetch from "node-fetch";

export default class StabilityClient {
  constructor(apiKey) {
    this.apiKey = apiKey;

    // NEW OFFICIAL WORKING ENDPOINT (2025)
    this.endpoint = "https://api.stability.ai/v2beta/stable-image/edit";
  }

  async generateHeadshot({ imageBuffer, prompt }) {
    const formData = new FormData();

    formData.append("image", new Blob([imageBuffer]), "selfie.png");
    formData.append("prompt", prompt);
    formData.append("strength", "0.6");
    formData.append("output_format", "png");

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return res.json(); // contains base64 images
  }
}
