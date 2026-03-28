const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-request`;

export interface MaintenanceFormData {
  title: string;
  description: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  location: string;
  service_type: string;
  priority: string;
  customer_notes: string;
  category_id: string;
  latitude: string;
  longitude: string;
}

export interface MaintenanceRequestResponse {
  data?: {
    request_number?: string;
  };
  error?: string;
  message?: string;
}

export interface MaintenanceRequestSummary {
  request_number?: string;
  title?: string;
  status?: string;
  priority?: string;
}

export interface MaintenanceRequestQueryResult {
  data: MaintenanceRequestSummary | MaintenanceRequestSummary[];
  error?: string;
}

export async function submitMaintenanceRequest(data: MaintenanceFormData, channel = "website") {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ ...data, channel }),
  });

  const result: MaintenanceRequestResponse = await resp.json();
  if (!resp.ok) {
    throw new Error(result.error || result.message || "Failed to submit");
  }

  return result;
}

export async function queryMaintenanceRequest(params: { request_number?: string; client_phone?: string }) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const resp = await fetch(`${API_URL}?${query}`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  const result: MaintenanceRequestQueryResult = await resp.json();
  if (!resp.ok) {
    throw new Error(result.error || "Failed to query");
  }

  return result;
}
