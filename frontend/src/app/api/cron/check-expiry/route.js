import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import nodemailer from "nodemailer";

// મેઈલ મોકલવા માટેનું ટ્રાન્સપોર્ટર સેટઅપ
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // તમારો ઈમેઈલ
        pass: process.env.EMAIL_PASS, // તમારો એપ પાસવર્ડ
    },
});

export async function GET(req) {
    try {
        // સિક્યુરિટી ચેક (Vercel Cron Secret)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        await connectMongo();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- ૧. પ્લાન એક્સપાયર થઈ ગયો હોય તેમને અપડેટ કરો અને મેઈલ કરો ---
        const expiredUsers = await Recruiter.find({
            "subscription.expiryDate": { $lt: today },
            "subscription.status": "Active"
        });

        for (let user of expiredUsers) {
            // સ્ટેટસ અપડેટ કરો
            user.subscription.status = "Expired";
            await user.save();

            // એક્સપાયરી મેઈલ મોકલો
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Your Subscription Plan has Expired - Shiven Group",
                html: `<h3>Hello ${user.fullName},</h3>
               <p>Your subscription plan for <b>${user.companyName}</b> has expired today.</p>
               <p>To continue posting jobs and accessing features, please renew your plan.</p>
               <br/><p>Team Shiven Group</p>`
            });
        }

        // --- ૨. જેનો પ્લાન ૩ દિવસમાં પૂરો થવાનો છે તેમને રિમાઇન્ડર મોકલો ---
        const reminderDate = new Date();
        reminderDate.setDate(today.getDate() + 3);
        reminderDate.setHours(0, 0, 0, 0);

        const nearExpiryUsers = await Recruiter.find({
            "subscription.expiryDate": reminderDate,
            "subscription.status": "Active"
        });

        for (let user of nearExpiryUsers) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Action Required: Your Plan Expires in 3 Days",
                html: `<h3>Hello ${user.fullName},</h3>
               <p>This is a friendly reminder that your current plan will expire on <b>${user.subscription.expiryDate.toDateString()}</b>.</p>
               <p>Renew now to avoid any interruption in your recruitment process.</p>
               <br/><p>Team Shiven Group</p>`
            });
        }

        return NextResponse.json({
            success: true,
            expiredUpdated: expiredUsers.length,
            remindersSent: nearExpiryUsers.length
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}