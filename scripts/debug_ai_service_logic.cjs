const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugAIService() {
    try {
        console.log("1. Fetch Active Clinics");
        const { data: allClinics, error: clinicsError } = await supabase
            .from('clinics')
            .select('id, name, owner_id, city, image_url')
            .eq('is_active', true);

        if (clinicsError) throw clinicsError;
        console.log(`Found ${allClinics.length} active clinics.`);
        console.log("Sample Clinic Owner:", allClinics[0]?.owner_id);

        const ownerIds = allClinics.map(c => c.owner_id).filter(Boolean);

        console.log("1.1 Fetch Profiles");
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', ownerIds);

        if (profilesError) throw profilesError;
        console.log(`Found ${profiles.length} profiles.`);

        console.log("3. Fetch Subscriptions");
        const { data: subscriptions, error: subsError } = await supabase
            .from('user_subscriptions')
            .select(`
                user_id,
                plan_id,
                status,
                subscription_plans (name, name_en, name_ar, limits)
            `)
            .in('user_id', ownerIds)
            .in('status', ['active', 'trialing']);

        if (subsError) throw subsError;
        console.log(`Found ${subscriptions.length} subscriptions.`);

        // Replicate logic
        allClinics.forEach(clinic => {
            const sub = subscriptions.find(s => s.user_id === clinic.owner_id);
            let limit = 50;
            let planName = 'Basic';

            if (sub) {
                console.log(`\nClinic: ${clinic.name} (Owner: ${clinic.owner_id})`);
                console.log("Raw Sub:", JSON.stringify(sub, null, 2));

                if (sub.subscription_plans) {
                    const sp = sub.subscription_plans;
                    planName = sp.name_ar || sp.name || sp.name_en || 'Basic';

                    if (sp.limits) {
                        try {
                            const limitsObj = typeof sp.limits === 'string' ? JSON.parse(sp.limits) : sp.limits;
                            console.log("Parsed Limits:", limitsObj);
                            const maxAi = limitsObj?.max_ai;

                            if (maxAi !== undefined && maxAi !== null) {
                                limit = Number(maxAi);
                            }
                        } catch (e) {
                            console.error('Error parsing limits:', e);
                        }
                    }
                }
            } else {
                console.log(`\nClinic: ${clinic.name} - NO SUBSCRIPTION FOUND`);
            }
            console.log(`-> Final Limit: ${limit}, Plan: ${planName}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

debugAIService();
