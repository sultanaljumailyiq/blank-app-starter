import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_SYSTEM_RULES: Record<string, string> = {
  image_analysis: `You are an expert dental radiologist and oral pathologist.
1. Analyze the provided dental image carefully.
2. Identify any visible pathologies (caries, bone loss, lesions).
3. Provide a structured JSON report with: diagnosis, severity (low/medium/high), findings (array of strings), recommendation.
4. If the image is unclear, mention it in findings.
5. Always be professional and concise.
6. Respond in Arabic.`,
  doctor_assistant: `You are a senior dental consultant assisting a dentist.
1. Provide evidence-based advice for diagnosis and treatment planning.
2. When asked about medications, verify patient history (if provided) for allergies.
3. Keep responses concise and clinically relevant.
4. Support Arabic queries.`,
  patient_assistant: `You are a friendly and empathetic dental clinic receptionist/assistant.
1. You work for "Smart Dental Platform".
2. Answer patient questions about dental procedures simply.
3. If they ask for medical advice, give general info but strictly advise visiting a doctor.
4. Help with appointment scheduling information.
5. Be polite and welcoming in Arabic.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      agent_type,
      message,
      image_url,
      context,
      session_id,
      clinic_id,
      history = [],
    } = body;

    if (!agent_type) {
      return new Response(
        JSON.stringify({ error: "agent_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Load agent config from DB ---
    let systemRules = DEFAULT_SYSTEM_RULES[agent_type] || DEFAULT_SYSTEM_RULES.patient_assistant;

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: agent } = await supabase
          .from("ai_agents")
          .select("system_rules, is_active, model")
          .eq("id", agent_type)
          .single();

        if (agent) {
          if (!agent.is_active) {
            return new Response(
              JSON.stringify({ error: "هذه الخدمة غير مفعلة حالياً." }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (agent.system_rules) {
            systemRules = agent.system_rules;
          }
        }
      } catch (e) {
        console.warn("Could not load agent config from DB, using defaults:", e);
      }
    }

    // --- Build messages array ---
    const systemContent =
      systemRules +
      (context ? `\n\nبيانات السياق: ${JSON.stringify(context, null, 2)}` : "");

    const messages: any[] = [{ role: "system", content: systemContent }];

    // Add conversation history
    if (Array.isArray(history) && history.length > 0) {
      messages.push(...history);
    }

    // Add current user message
    if (agent_type === "image_analysis" && image_url) {
      // Vision request: include image as base64 or URL
      const userContent: any[] = [];
      if (message) {
        userContent.push({ type: "text", text: message });
      } else {
        userContent.push({ type: "text", text: "حلل هذه الصورة السنية بدقة وأعط تقريراً تفصيلياً." });
      }
      userContent.push({
        type: "image_url",
        image_url: { url: image_url },
      });
      messages.push({ role: "user", content: userContent });
    } else {
      messages.push({ role: "user", content: message || "" });
    }

    // --- Call Lovable AI Gateway ---
    // Use gemini-2.5-pro for image analysis (vision), gemini-3-flash-preview for chat
    const model =
      agent_type === "image_analysis"
        ? "google/gemini-2.5-pro"
        : "google/gemini-3-flash-preview";

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "رصيد الذكاء الاصطناعي غير كافٍ. يرجى إضافة رصيد." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "";
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // --- Log usage ---
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const authHeader = req.headers.get("Authorization");
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: authHeader ? { Authorization: authHeader } : {} },
        });

        let userId: string | null = null;
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const { data } = await supabase.auth.getClaims(token);
          userId = data?.claims?.sub || null;
        }

        await supabase.from("ai_usage_logs").insert({
          agent_id: agent_type,
          user_id: userId,
          clinic_id: clinic_id || null,
          session_id: session_id || null,
          tokens_used: tokensUsed,
          request_type: agent_type,
          user_type: userId ? "clinic" : "guest",
        });
      } catch (e) {
        console.warn("Failed to log usage:", e);
      }
    }

    // --- For image_analysis: try to parse structured response ---
    if (agent_type === "image_analysis") {
      try {
        // Try to extract JSON from markdown code blocks or raw JSON
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        const parsed = JSON.parse(jsonStr);

        return new Response(
          JSON.stringify({ success: true, type: "analysis", result: parsed, raw: responseText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (_) {
        // Return as text with structured format
        return new Response(
          JSON.stringify({ success: true, type: "analysis", result: null, raw: responseText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, type: "chat", response: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
