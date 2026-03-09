Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, clinicData, clinicId, doctorId } = await req.json();

        // التحقق من المعرف
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'create':
                // إنشاء عيادة جديدة
                const insertData = {
                    name: clinicData.name,
                    address: clinicData.address,
                    phone: clinicData.phone,
                    location_lat: clinicData.location.lat,
                    location_lng: clinicData.location.lng,
                    rating: clinicData.rating || 4.5,
                    specialties: clinicData.specialties || [],
                    working_hours: clinicData.workingHours,
                    description: clinicData.description,
                    is_active: true
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/clinics`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(insertData)
                });

                if (!insertResponse.ok) {
                    const errorText = await insertResponse.text();
                    throw new Error(`Failed to create clinic: ${errorText}`);
                }

                result = await insertResponse.json();
                break;

            case 'update':
                // تحديث بيانات العيادة
                if (!clinicId) {
                    throw new Error('Clinic ID is required for update');
                }

                const updateData = {
                    name: clinicData.name,
                    address: clinicData.address,
                    phone: clinicData.phone,
                    location_lat: clinicData.location.lat,
                    location_lng: clinicData.location.lng,
                    rating: clinicData.rating,
                    specialties: clinicData.specialties,
                    working_hours: clinicData.workingHours,
                    description: clinicData.description,
                    updated_at: new Date().toISOString()
                };

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/clinics?id=eq.${clinicId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(updateData)
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update clinic: ${errorText}`);
                }

                result = await updateResponse.json();
                break;

            case 'get':
                // جلب بيانات العيادة
                let getUrl = `${supabaseUrl}/rest/v1/clinics?select=*&is_active=eq.true`;
                
                if (clinicId) {
                    getUrl += `&id=eq.${clinicId}`;
                }
                
                if (doctorId) {
                    getUrl += `&doctor_id=eq.${doctorId}`;
                }

                const getResponse = await fetch(getUrl, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!getResponse.ok) {
                    const errorText = await getResponse.text();
                    throw new Error(`Failed to fetch clinics: ${errorText}`);
                }

                result = await getResponse.json();
                break;

            case 'delete':
                // حذف العيادة (تغيير الحالة إلى غير نشطة)
                if (!clinicId) {
                    throw new Error('Clinic ID is required for delete');
                }

                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/clinics?id=eq.${clinicId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    throw new Error(`Failed to delete clinic: ${errorText}`);
                }

                result = { success: true };
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Clinic management error:', error);

        const errorResponse = {
            error: {
                code: 'CLINIC_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
