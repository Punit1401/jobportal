export const ACCESS_STAGES = {
  PROFILE_INCOMPLETE: "profile_incomplete",
  PENDING_ADMIN: "pending_admin",
  REJECTED: "rejected",
  NEED_SUBSCRIPTION: "need_subscription",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  ACTIVE: "active",
};

export function isRecruiterProfileComplete(user) {
  if (!user) return false;
  return Boolean(
    user.companyName?.trim() &&
      user.mobile?.trim() &&
      user.designation?.trim() &&
      user.location?.trim() &&
      user.aadharNo?.trim() &&
      user.panNo?.trim()
  );
}

export function isServiceProviderProfileComplete(user) {
  if (!user) return false;
  return Boolean(
    user.providerName?.trim() &&
      user.serviceCategory?.trim() &&
      user.mobile?.trim() &&
      user.aadharNumber?.trim() &&
      user.panNumber?.trim()
  );
}

export function isAdminApproved(user, role) {
  if (!user) return false;
  if (role === "candidate" || role === "user") {
    return true;
  }
  if (role === "recruiter") {
    return Boolean(
      !user.isRejected &&
        (user.isApproved === true || user.status === "approved")
    );
  }
  if (role === "serviceprovider") {
    return Boolean(
      !user.isRejected &&
        (user.status === "approved" || user.isApproved === true)
    );
  }
  return false;
}

export function isRejected(user, role) {
  if (!user) return false;
  if (role === "recruiter") return Boolean(user.isRejected);
  if (role === "serviceprovider") {
    return user.status === "rejected" || Boolean(user.isRejected);
  }
  return false;
}

export function getSubscriptionState(user) {
  const sub = user?.subscription;
  const planId = sub?.planId?._id || sub?.planId;
  if (!planId || sub.status !== "Active") {
    return { active: false, reason: "none" };
  }
  if (sub.expiryDate && new Date() > new Date(sub.expiryDate)) {
    return { active: false, reason: "expired" };
  }
  return { active: true };
}

export function getPartnerAccess(user, role) {
  const profileUrl =
    role === "recruiter" ? "/recruiter/profile" : "/serviceprovider/profile";
  const subscriptionsUrl =
    role === "recruiter" ? "/recruiter/subscriptions" : "/serviceprovider/subscriptions";
  const walletUrl = role === "recruiter" ? "/recruiter/wallet" : "/serviceprovider/wallet";

  if (!user) {
    return {
      stage: ACCESS_STAGES.PROFILE_INCOMPLETE,
      canUseSystem: false,
      profileUrl,
      subscriptionsUrl,
      walletUrl,
    };
  }

  if (isRejected(user, role)) {
    return {
      stage: ACCESS_STAGES.REJECTED,
      canUseSystem: false,
      profileUrl,
      subscriptionsUrl,
      walletUrl,
    };
  }

  // Admin approved → subscription is next (do not block on optional KYC if already verified)
  if (isAdminApproved(user, role)) {
    const sub = getSubscriptionState(user);
    if (!sub.active) {
      return {
        stage:
          sub.reason === "expired"
            ? ACCESS_STAGES.SUBSCRIPTION_EXPIRED
            : ACCESS_STAGES.NEED_SUBSCRIPTION,
        canUseSystem: false,
        canPurchasePlan: true,
        profileUrl,
        subscriptionsUrl,
        walletUrl,
      };
    }

    return {
      stage: ACCESS_STAGES.ACTIVE,
      canUseSystem: true,
      subscription: user.subscription,
      profileUrl,
      subscriptionsUrl,
      walletUrl,
    };
  }

  const profileComplete =
    role === "recruiter"
      ? isRecruiterProfileComplete(user)
      : isServiceProviderProfileComplete(user);

  if (!profileComplete) {
    return {
      stage: ACCESS_STAGES.PROFILE_INCOMPLETE,
      canUseSystem: false,
      profileUrl,
      subscriptionsUrl,
      walletUrl,
    };
  }

  return {
    stage: ACCESS_STAGES.PENDING_ADMIN,
    canUseSystem: false,
    profileUrl,
    subscriptionsUrl,
    walletUrl,
  };
}

export function accessErrorMessage(access, lang = "en") {
  const messages = {
    en: {
      profile_incomplete: "Please complete your profile first.",
      pending_admin: "Your profile is pending admin verification.",
      rejected: "Your profile was rejected.",
      need_subscription: "Please purchase a subscription plan to use the system.",
      subscription_expired: "Your subscription has expired. Please renew.",
      active: "",
    },
  };
  const pack = messages[lang] || messages.en;
  return pack[access.stage] || "";
}
