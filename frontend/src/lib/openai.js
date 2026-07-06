import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(text) {
  const prompt = `
Your task:
1. Improve this resume
2. Extract missing keywords
3. Give ATS score out of 100
4. Provide bullet point suggestions

Resume text:
${text}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      { role: "system", content: "You are an expert resume analyst." },
      { role: "user", content: prompt },
    ],
  });

  return res.choices[0].message.content;
}
