import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EXTERNAL_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY");

    if (!EXTERNAL_URL || !EXTERNAL_KEY) {
      throw new Error("External database credentials not configured");
    }

    const externalSupabase = createClient(EXTERNAL_URL, EXTERNAL_KEY);

    if (req.method === "POST") {
      const body = await req.json();

      // Validate required fields
      if (!body.client_name || !body.client_phone || !body.title) {
        return new Response(
          JSON.stringify({ error: "client_name, client_phone, and title are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sanitize and prepare data
      const record: Record<string, unknown> = {
        title: String(body.title).slice(0, 500),
        description: body.description ? String(body.description).slice(0, 2000) : null,
        client_name: String(body.client_name).slice(0, 200),
        client_phone: String(body.client_phone).slice(0, 20),
        client_email: body.client_email ? String(body.client_email).slice(0, 200) : null,
        location: body.location ? String(body.location).slice(0, 500) : null,
        service_type: body.service_type || null,
        priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "medium",
        status: "Open",
        channel: body.channel || "website",
        customer_notes: body.customer_notes ? String(body.customer_notes).slice(0, 2000) : null,
        category_id: body.category_id || null,
        subcategory_id: body.subcategory_id || null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        workflow_stage: "draft",
        opened_by_role: body.opened_by_role || null,
        company_id: body.company_id || null,
        branch_id: body.branch_id || null,
        property_id: body.property_id || null,
      };

      const { data, error } = await externalSupabase
        .from("maintenance_requests")
        .insert(record)
        .select("id, request_number")
        .single();

      if (error) {
        console.error("Insert error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create maintenance request", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
