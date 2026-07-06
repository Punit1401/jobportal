import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";

export async function POST(req) {
    try {
        const { type, input } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!input) {
            return NextResponse.json({ error: "Input is required" }, { status: 400 });
        }

        await connectMongo();
        const session = await getServerSession(authOptions);
        
        let recruiterContext = "";
        if (session?.user?.email) {
            const recruiter = await Recruiter.findOne({ email: session.user.email }).lean();
            if (recruiter) {
                recruiterContext = `Company Name: ${recruiter.companyName || 'N/A'}. 
Company Description: ${recruiter.description || 'A professional company looking for talent.'}`;
            }
        }

        let systemPrompt = "";
        if (type === 'jd') {
            systemPrompt = `You are an HR Expert. Generate a professional, SEO-optimized Job Description based on the job title provided. 
            CONTEXT: You are writing for this company:
            ${recruiterContext}
            Include Responsibilities, Requirements, and a brief "About the Company" section using the provided context. Keep it concise and impactful.`;
        } else if (type === 'skills') {
            systemPrompt = `You are a Technical Talent Scout. Based on the job title provided and the company background:
            ${recruiterContext}
            List the top 10 most essential technical and soft skills required. Format as a comma-separated list of keywords.`;
        } else if (type === 'questions') {
            systemPrompt = `You are a Technical Interviewer. Generate 5-7 relevant interview questions and expected answers for the role and company context:
            ${recruiterContext}`;
        } else if (type === 'email') {
            systemPrompt = `You are a Recruitment Marketing Expert. Write a personalized, high-conversion outreach email for the role and company provided:
            ${recruiterContext}`;
        } else {
            systemPrompt = `You are an AI Recruitment Assistant. Help the recruiter with their request. 
            Company Context: ${recruiterContext}`;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": input }
                ],
            }),
        });

        const data = await response.json();
        const result = data.choices[0].message.content;

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Recruiter AI API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate AI response" }, { status: 500 });
    }
}
