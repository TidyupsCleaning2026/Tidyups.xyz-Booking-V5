const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_type: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  address: string;
  message: string;
  status: "New" | "Contacted" | "Booked" | "Closed";
  created_at: string;
};

export type LeadInput = Omit<Lead, "id" | "status" | "created_at">;

async function handle(res: Response) {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const res = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/admin/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (res.status === 401) return false;
  await handle(res);
  return true;
}

export async function listLeads(pin: string): Promise<Lead[]> {
  const res = await fetch(`${BASE}/api/leads`, {
    headers: { "x-admin-pin": pin },
  });
  return handle(res);
}

export async function updateLeadStatus(id: string, status: Lead["status"], pin: string): Promise<Lead> {
  const res = await fetch(`${BASE}/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-pin": pin },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}
