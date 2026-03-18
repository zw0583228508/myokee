const API_BASE = "";

export async function fetchAnalytics<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/analytics/${endpoint}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
