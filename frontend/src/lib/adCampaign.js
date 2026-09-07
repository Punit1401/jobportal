export function resolveCampaignStatus(campaign) {
  if (!campaign) return "Expired";
  if (campaign.status === "Paused") return "Paused";
  if (campaign.status === "Completed") return "Completed";
  if (campaign.expiresAt && new Date(campaign.expiresAt) < new Date()) return "Expired";
  return campaign.status || "Active";
}

export function enrichCampaign(campaign) {
  const doc = campaign.toObject ? campaign.toObject() : { ...campaign };
  const displayStatus = resolveCampaignStatus(doc);
  const isExpired = displayStatus === "Expired";
  return {
    ...doc,
    displayStatus,
    isExpired,
    planTitle: doc.planId?.title || doc.name,
  };
}
