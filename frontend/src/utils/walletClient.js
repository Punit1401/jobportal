export async function purchaseFromWallet(payload) {
  const res = await fetch("/api/wallet/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Purchase failed");
  }
  return data;
}
