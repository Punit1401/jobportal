import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import { getPartnerAccess } from "@/lib/partnerAccess";

async function getPartnerByEmail(email, role) {
  if (role === "recruiter") {
    return Recruiter.findOne({ email }).populate("subscription.planId");
  }
  if (role === "serviceprovider") {
    return ServiceProvider.findOne({ email }).populate("subscription.planId");
  }
  return null;
}

function accessErrorForApi(stage) {
  const map = {
    profile_incomplete: "Please complete your profile first.",
    pending_admin: "Your profile is pending admin verification.",
    rejected: "Your profile was rejected.",
    need_subscription: "Please purchase a subscription plan.",
    subscription_expired: "Your subscription has expired. Please renew.",
  };
  return map[stage] || "Access denied.";
}

export async function assertPartnerCanUseFeatures(email, role) {
  const user = await getPartnerByEmail(email, role);
  const access = getPartnerAccess(user, role);
  if (!access.canUseSystem) {
    const err = new Error(accessErrorForApi(access.stage));
    err.code = access.stage;
    err.status = 403;
    throw err;
  }
  return user;
}

export async function checkLimit(email, role, actionType) {
  const user = await assertPartnerCanUseFeatures(email, role);
  const plan = user.subscription?.planId;

  if (!plan) {
    throw new Error("No active subscription plan found.");
  }

  const { usedJobs = 0, usedLeads = 0 } = user.subscription;

  if (actionType === "POST_JOB") {
    const limit = plan.limits?.jobLimit ?? 0;
    if (limit > 0 && usedJobs >= limit) {
      throw new Error(`Job limit reached! You can only post ${limit} jobs on this plan.`);
    }
  }

  if (actionType === "POST_SERVICE" || actionType === "ACCESS_LEAD") {
    const limit = plan.limits?.leadLimit ?? 0;
    if (limit > 0 && usedLeads >= limit) {
      throw new Error(`Service limit reached! You can only publish ${limit} services on this plan.`);
    }
  }

  return { user, plan };
}

export async function incrementUsage(email, role, actionType) {
  const inc =
    actionType === "POST_JOB"
      ? { "subscription.usedJobs": 1 }
      : { "subscription.usedLeads": 1 };

  const Model = role === "recruiter" ? Recruiter : ServiceProvider;
  await Model.findOneAndUpdate({ email }, { $inc: inc });
}
