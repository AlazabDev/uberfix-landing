import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_BASE = "https://zrrffsjbfkphridqyais.supabase.co/functions/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("EXTERNAL_GATEWAY_API_KEY");
    if (!API_KEY) {
      throw new Error("External gateway API key not configured");
    }

    const url = new URL(req.url);

    // GET: query maintenance requests
    if (req.method === "GET") {
      const request_number = url.searchParams.get("request_number");
      const client_phone = url.searchParams.get("client_phone");

      if (!request_number && !client_phone) {
        return new Response(
          JSON.stringify({ error: "Provide request_number or client_phone" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const params = new URLSearchParams();
      if (request_number) params.set("request_number", request_number);
      if (client_phone) params.set("client_phone", client_phone);

      const resp = await fetch(`${GATEWAY_BASE}/query-maintenance-requests?${params}`, {
        headers: { "x-api-key": API_KEY },
      });

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: create maintenance request
    if (req.method === "POST") {
      const body = await req.json();

      if (!body.client_name || !body.client_phone || !body.title) {
        return new Response(
          JSON.stringify({ error: "client_name, client_phone, and title are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const payload: Record<string, unknown> = {
        channel: body.channel || "website",
        client_name: String(body.client_name).slice(0, 200),
        client_phone: String(body.client_phone).slice(0, 20),
        client_email: body.client_email ? String(body.client_email).slice(0, 200) : undefined,
        title: String(body.title).slice(0, 500),
        description: body.description ? String(body.description).slice(0, 2000) : undefined,
        service_type: body.service_type || undefined,
        priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "medium",
        location: body.location ? String(body.location).slice(0, 500) : undefined,
        customer_notes: body.customer_notes ? String(body.customer_notes).slice(0, 2000) : undefined,
        category_id: body.category_id || undefined,
        subcategory_id: body.subcategory_id || undefined,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      };

      // Remove undefined values
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const resp = await fetch(`${GATEWAY_BASE}/maintenance-gateway`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("maintenance-request error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
