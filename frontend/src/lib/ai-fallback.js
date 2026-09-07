export async function fetchWithFallback(messages, temperature = 0.1) {
  const models = [
    "google/gemma-4-31b-it",             // Primary
    "meta-llama/llama-3.3-70b-instruct", // Fallback 1
    "meta-llama/llama-3.2-3b-instruct",  // Fallback 2
    "openai/gpt-4o-mini"                 // Fallback 3 (reliable generic fallback)
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[AI Fallback] Trying model: ${model}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          "X-Title": "Shivengroup Portal",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI Fetch Failed");
      }

      console.log(`[AI Fallback] Success with model: ${model}`);
      return data.choices[0].message.content.trim();
      
    } catch (error) {
      console.warn(`[AI Fallback] Model ${model} failed. Error: ${error.message}`);
      lastError = error;
      // Continues to next model in the array
    }
  }

  // If all models fail
  throw new Error("All AI Fallback models failed. Last error: " + lastError.message);
}
