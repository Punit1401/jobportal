/**
 * Public site URL for a portfolio username (subdomain in prod, /p/ slug in dev).
 */
export function getPublicSiteUrl(username, origin) {
  if (!username) return "";

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (root && !root.includes("localhost")) {
    const host = root.split(":")[0];
    const proto =
      origin?.startsWith("https") || (typeof window !== "undefined" && window.location.protocol === "https:")
        ? "https"
        : "http";
    return `${proto}://${host}/p/${username}`;
  }

  if (typeof window !== "undefined") {
    const { protocol, port, hostname } = window.location;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      const p = port ? `:${port}` : "";
      return `${protocol}//localhost${p}/p/${username}`;
    }
    return `${window.location.origin}/p/${username}`;
  }

  if (origin) return `${origin}/p/${username}`;
  return `/p/${username}`;
}

export function getSubdomainHint() {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (root && !root.includes("localhost")) {
    return `${root.split(":")[0]}/p/yourname`;
  }
  return "localhost:3000/p/yourname";
}
