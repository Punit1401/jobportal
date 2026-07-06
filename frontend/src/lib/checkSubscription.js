import Plan from "@/models/Plan";
import Recruiter from "@/models/Recruiter";

export async function checkLimit(userId, actionType) {
    // ૧. યુઝરનો પ્લાન ડેટા મેળવો
    const user = await Recruiter.findById(userId).populate("subscription.planId");

    if (!user || !user.subscription.planId) {
        throw new Error("No active subscription plan found.");
    }

    const { planId, expiryDate, usedJobs, usedLeads } = user.subscription;

    // ૨. એક્સપાયરી ચેક કરો
    if (new Date() > new Date(expiryDate)) {
        throw new Error("Your subscription has expired. Please renew.");
    }

    // ૩. એક્શન મુજબ લિમિટ ચેક કરો
    if (actionType === "POST_JOB") {
        if (usedJobs >= planId.features.jobLimit) {
            throw new Error(`Limit reached! You can only post ${planId.features.jobLimit} jobs in this plan.`);
        }
    }

    if (actionType === "ACCESS_LEAD") {
        if (usedLeads >= planId.features.leadLimit) {
            throw new Error(`Limit reached! You can only access ${planId.features.leadLimit} leads.`);
        }
    }

    return true;
}