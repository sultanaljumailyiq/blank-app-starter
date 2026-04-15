import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_ANALYSIS_SYSTEM = `You are an expert dental radiologist, oral pathologist, and dental imaging specialist with 20+ years of clinical experience.

## Your Role
Analyze dental radiographic images (panoramic, periapical, bitewing, CBCT, intraoral photos) with clinical precision.

## Analysis Protocol
1. **Image Quality Assessment**: Evaluate exposure, contrast, positioning, and diagnostic utility.
2. **Systematic Tooth-by-Tooth Examination**: Check each visible tooth using FDI numbering system.
3. **Pathology Detection**: Identify caries (initial, moderate, deep), periapical lesions, bone loss (horizontal/vertical), root resorption, fractures, impacted teeth, cysts, calculus, and any abnormalities.
4. **Severity Grading**: Rate each finding as low/medium/high severity.
5. **Bounding Box Localization**: For EACH detected issue, provide precise normalized bounding box coordinates [x, y, width, height] where values are 0-1 representing percentage of image dimensions. x=left edge, y=top edge, width and height are proportional sizes.
6. **Clinical Recommendations**: Provide specific treatment suggestions for each finding.

## Important Guidelines
- Be thorough but precise. Don't fabricate findings.
- If image quality is poor, note it but still analyze what's visible.
- Use FDI tooth numbering (11-48).
- Provide confidence levels for each finding.
- Always respond in Arabic.
- Each issue MUST include a bounding box for visual annotation.`;

const DEFAULT_SYSTEM_RULES: Record<string, string> = {
  image_analysis: IMAGE_ANALYSIS_SYSTEM,
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

// Tool definition for structured dental analysis output
const DENTAL_ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "dental_analysis_report",
    description: "Generate a structured dental analysis report with tooth annotations and bounding boxes",
    parameters: {
      type: "object",
      properties: {
        diagnosis: {
          type: "string",
          description: "Overall diagnosis summary in Arabic"
        },
        severity: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Overall severity level"
        },
        confidence: {
          type: "number",
          description: "Overall confidence score 0-1"
        },
        image_quality: {
          type: "string",
          enum: ["excellent", "good", "fair", "poor"],
          description: "Quality assessment of the radiographic image"
        },
        summary: {
          type: "string",
          description: "Detailed clinical summary in Arabic covering all findings"
        },
        issues: {
          type: "array",
          description: "Array of detected dental issues with precise locations",
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
                description: "Short label for the issue in Arabic (e.g. 'تسوس عميق - السن 36')"
              },
              tooth_number: {
                type: "string",
                description: "FDI tooth number (e.g. '36', '11', 'multiple')"
              },
              category: {
                type: "string",
                enum: ["caries", "bone_loss", "periapical", "fracture", "impaction", "calculus", "resorption", "other"],
                description: "Category of the dental issue"
              },
              confidence: {
                type: "number",
                description: "Confidence score 0-1 for this specific finding"
              },
              severity: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Severity of this specific issue"
              },
              description: {
                type: "string",
                description: "Detailed description of the finding in Arabic"
              },
              box: {
                type: "array",
                items: { type: "number" },
                description: "Bounding box [x, y, width, height] as normalized 0-1 values"
              },
              treatment_suggestion: {
                type: "string",
                description: "Suggested treatment in Arabic"
              }
            },
            required: ["label", "tooth_number", "category", "confidence", "severity", "description", "box"]
          }
        },
        findings: {
          type: "array",
          items: { type: "string" },
          description: "List of key findings in Arabic as bullet points"
        },
        recommendation: {
          type: "string",
          description: "Overall treatment recommendations in Arabic"
        },
        affected_teeth: {
          type: "array",
          items: { type: "string" },
          description: "List of affected tooth numbers using FDI system"
        }
      },
      required: ["diagnosis", "severity", "confidence", "summary", "issues", "findings", "recommendation"]
    }
  }
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
      image_base64,
      image_mime_type,
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

    // Build request body
    const requestBody: any = {
      model: agent_type === "image_analysis"
        ? "google/gemini-2.5-pro"
        : "google/gemini-3-flash-preview",
      messages,
      stream: false,
    };

    // Add current user message
    if (agent_type === "image_analysis" && (image_base64 || image_url)) {
      const userContent: any[] = [];
      userContent.push({
        type: "text",
        text: message || "حلل هذه الصورة السنية بدقة عالية. حدد جميع المشاكل المرئية مع تحديد مواقعها بدقة على الصورة باستخدام bounding boxes. استخدم نظام ترقيم FDI للأسنان."
      });

      if (image_base64) {
        const mime = image_mime_type || "image/jpeg";
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${mime};base64,${image_base64}` },
        });
      } else {
        userContent.push({
          type: "image_url",
          image_url: { url: image_url },
        });
      }
      messages.push({ role: "user", content: userContent });

      // Use tool calling for structured output
      requestBody.tools = [DENTAL_ANALYSIS_TOOL];
      requestBody.tool_choice = { type: "function", function: { name: "dental_analysis_report" } };
    } else {
      messages.push({ role: "user", content: message || "" });
    }

    // --- Call Lovable AI Gateway ---
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
          try {
            const token = authHeader.replace("Bearer ", "");
            const { data } = await supabase.auth.getUser(token);
            userId = data?.user?.id || null;
          } catch (_) {}
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

    // --- For image_analysis: extract tool call result ---
    if (agent_type === "image_analysis") {
      const choice = aiData.choices?.[0];
      
      // Try tool call first (structured output)
      if (choice?.message?.tool_calls?.[0]) {
        try {
          const toolCall = choice.message.tool_calls[0];
          const parsed = JSON.parse(toolCall.function.arguments);
          
          return new Response(
            JSON.stringify({ success: true, type: "analysis", result: parsed, raw: toolCall.function.arguments }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("Failed to parse tool call result:", e);
        }
      }
      
      // Fallback: try to parse from content
      const responseText = choice?.message?.content || "";
      try {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        const parsed = JSON.parse(jsonStr);

        return new Response(
          JSON.stringify({ success: true, type: "analysis", result: parsed, raw: responseText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (_) {
        return new Response(
          JSON.stringify({ success: true, type: "analysis", result: null, raw: responseText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const responseText = aiData.choices?.[0]?.message?.content || "";
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
