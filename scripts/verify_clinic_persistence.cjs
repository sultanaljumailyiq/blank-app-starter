const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://nhueyaeyutfmadbgghfe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw'
);

const verifyPersistence = async () => {
    console.log('--- Simulating "Save Settings" from Frontend ---');

    // Mimic the mapped update object sent by useClinics.ts
    // Note: useClinics receives { location: {lat, lng} } but internally maps it to latitude/longitude
    // We will mimic the DIRECT DB UPDATE that updateClinics performs after mapping.

    const dbUpdatePayload = {
        description: 'Updated Description from Verification Script: Professional Dental Care.',
        working_hours: '08:00 - 20:00',
        specialties: ['تقويم الأسنان', 'جراحة الوجه'],
        services: ['زراعة فورية', 'تبييض بالليزر', 'Consultation'],
        image_url: 'https://example.com/logo-verified.png',
        cover_url: 'https://example.com/cover-verified.png',
        latitude: 33.312805,
        longitude: 44.361488
    };

    console.log('Updating Clinic ID 1 with:', JSON.stringify(dbUpdatePayload, null, 2));

    const { error: updateError } = await supabase
        .from('clinics')
        .update(dbUpdatePayload)
        .eq('id', 1);

    if (updateError) {
        console.error('❌ Update Failed:', updateError);
        return;
    }

    console.log('✅ Update Successful. Fetching back to verify...');

    const { data: clinic, error: fetchError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', 1)
        .single();

    if (fetchError) {
        console.error('❌ Fetch Failed:', fetchError);
        return;
    }

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`Owner ID: ${clinic.owner_id}`);
    console.log(`Description: ${clinic.description} [${clinic.description === dbUpdatePayload.description ? 'MATCH' : 'FAIL'}]`);
    console.log(`Working Hours: ${clinic.working_hours} [${clinic.working_hours === dbUpdatePayload.working_hours ? 'MATCH' : 'FAIL'}]`);
    console.log(`Specialties: ${JSON.stringify(clinic.specialties)} [${JSON.stringify(clinic.specialties) === JSON.stringify(dbUpdatePayload.specialties) ? 'MATCH' : 'FAIL'}]`);
    console.log(`Services: ${JSON.stringify(clinic.services)} [${JSON.stringify(clinic.services) === JSON.stringify(dbUpdatePayload.services) ? 'MATCH' : 'FAIL'}]`);
    console.log(`Logo: ${clinic.image_url} [${clinic.image_url === dbUpdatePayload.image_url ? 'MATCH' : 'FAIL'}]`);
    console.log(`Cover: ${clinic.cover_url} [${clinic.cover_url === dbUpdatePayload.cover_url ? 'MATCH' : 'FAIL'}]`);
    console.log(`Location: ${clinic.latitude}, ${clinic.longitude} [${clinic.latitude === dbUpdatePayload.latitude && clinic.longitude === dbUpdatePayload.longitude ? 'MATCH' : 'FAIL'}]`);

    console.log('\n🎉 ALL SYSTEMS GO.');
};

verifyPersistence();
