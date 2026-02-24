const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: withAuth({}),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: withAuth({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function withAuth(headers: Record<string, string>) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}
