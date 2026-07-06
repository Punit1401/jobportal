import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Inquiry from '@/models/Inquiry';
import ServiceForm from '@/models/serviceform';

export async function GET(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

        const email = session.user.email;

        // 1. બધી ઇન્કવાયરી ફેચ કરો
        const inquiries = await Inquiry.find({ providerEmail: email }).sort({ createdAt: -1 });

        // 2. કુલ વ્યુઝ (Views) ગણવા
        const services = await ServiceForm.find({ providerEmail: email });
        const totalViews = services.reduce((acc, curr) => acc + (curr.views || 0), 0);

        // 3. સર્વિસ વાઈઝ પરફોર્મન્સ (Stats Page માટે)
        const servicePerformance = services.map(s => ({
            name: s.title,
            views: s.views || 0,
            percent: totalViews > 0 ? Math.round(((s.views || 0) / totalViews) * 100) : 0
        }));

        return NextResponse.json({ 
            success: true, 
            inquiries, 
            stats: {
                totalViews,
                inquiryCount: inquiries.length,
                urgentCount: inquiries.filter(i => i.status === 'urgent').length,
                servicePerformance
            }
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message });
    }
}