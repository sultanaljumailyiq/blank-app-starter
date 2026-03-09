Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { dataType } = await req.json();

        // التحقق من المعرف
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        if (dataType === 'clinics' || dataType === 'all') {
            // بيانات العيادات العراقية
            const clinicsData = [
                {
                    name: 'عيادة النور للأسنان',
                    address: 'شارع الكرادة، بغداد',
                    phone: '+964 770 234 5678',
                    location_lat: 33.3152,
                    location_lng: 44.3661,
                    rating: 4.8,
                    specialties: ['تقويم', 'تجميل', 'زراعة'],
                    working_hours: '9:00 ص - 10:00 م',
                    description: 'عيادة متخصصة في جميع علاجات الأسنان مع أحدث التقنيات',
                    is_active: true
                },
                {
                    name: 'مركز الابتسامة الطبي',
                    address: 'شارع الزبير، البصرة',
                    phone: '+964 771 345 6789',
                    location_lat: 30.5085,
                    location_lng: 47.7804,
                    rating: 4.9,
                    specialties: ['تجميل', 'تبييض', 'فينير'],
                    working_hours: '8:00 ص - 11:00 م',
                    description: 'نخبة من الأطباء المتخصصين في طب الأسنان التجميلي',
                    is_active: true
                },
                {
                    name: 'عيادات الرعاية المتقدمة',
                    address: 'شارع 100 متر، أربيل',
                    phone: '+964 750 456 7890',
                    location_lat: 36.1911,
                    location_lng: 44.0091,
                    rating: 4.7,
                    specialties: ['جراحة', 'زراعة', 'علاج عصب'],
                    working_hours: '10:00 ص - 9:00 م',
                    description: 'مركز طبي شامل لجميع تخصصات طب الأسنان',
                    is_active: true
                },
                {
                    name: 'عيادة كربلاء الطبية',
                    address: 'شارع الحائري، كربلاء',
                    phone: '+964 770 345 6789',
                    location_lat: 32.606,
                    location_lng: 44.0251,
                    rating: 4.6,
                    specialties: ['علاج عصب', 'تقويم', 'جراحة'],
                    working_hours: '9:00 ص - 8:00 م',
                    description: 'مركز طبي متقدم في مدينة كربلاء المقدسة',
                    is_active: true
                },
                {
                    name: 'عيادات النجف المتخصصة',
                    address: 'شارع الصحن الشريف، النجف',
                    phone: '+964 781 456 7890',
                    location_lat: 32.0075,
                    location_lng: 44.3183,
                    rating: 4.7,
                    specialties: ['تجميل', 'زراعة', 'تبييض'],
                    working_hours: '10:00 ص - 9:00 م',
                    description: 'عيادات متطورة في مدينة النجف الأشرف',
                    is_active: true
                },
                {
                    name: 'مركز سامراء الطبي',
                    address: 'شارع，查尔基،سامراء',
                    phone: '+964 770 567 8901',
                    location_lat: 34.2003,
                    location_lng: 43.8774,
                    rating: 4.5,
                    specialties: ['جراحة', 'علاج عصب'],
                    working_hours: '9:00 ص - 7:00 م',
                    description: 'مركز طبي يخدم مدينة سامراء والقرى المحيطة',
                    is_active: true
                },
                {
                    name: 'عيادات السليمانية الحديثة',
                    address: 'شارع الجامعة، السليمانية',
                    phone: '+964 750 678 9012',
                    location_lat: 35.564,
                    location_lng: 45.4348,
                    rating: 4.8,
                    specialties: ['تقويم', 'تجميل', 'زراعة'],
                    working_hours: '8:00 ص - 10:00 م',
                    description: 'عيادات حديثة في السليمانية مع أحدث التقنيات',
                    is_active: true
                },
                {
                    name: 'مركز الموصل الشامل',
                    address: 'شارع الكرامة، الموصل',
                    phone: '+964 770 789 0123',
                    location_lat: 36.3463,
                    location_lng: 43.1289,
                    rating: 4.4,
                    specialties: ['جراحة', 'تقويم', 'علاج عصب'],
                    working_hours: '9:00 ص - 8:00 م',
                    description: 'مركز طبي شامل في الموصل',
                    is_active: true
                },
                {
                    name: 'عيادات الأنبار الطبية',
                    address: 'شارع النصر، الرمادي',
                    phone: '+964 781 890 1234',
                    location_lat: 33.3782,
                    location_lng: 43.7845,
                    rating: 4.3,
                    specialties: ['تجميل', 'تبييض'],
                    working_hours: '10:00 ص - 7:00 م',
                    description: 'عيادة متخصصة في مدينة الرمادي',
                    is_active: true
                },
                {
                    name: 'مركز ديالي الطبي',
                    address: 'شارع المعامل، بعقوبة',
                    phone: '+964 750 901 2345',
                    location_lat: 33.7455,
                    location_lng: 44.9671,
                    rating: 4.5,
                    specialties: ['جراحة', 'تقويم'],
                    working_hours: '9:00 ص - 8:00 م',
                    description: 'مركز طبي يخدم محافظة ديالي',
                    is_active: true
                }
            ];

            const clinicsResponse = await fetch(`${supabaseUrl}/rest/v1/clinics`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(clinicsData)
            });

            if (!clinicsResponse.ok) {
                const errorText = await clinicsResponse.text();
                throw new Error(`Failed to seed clinics: ${errorText}`);
            }

            result = await clinicsResponse.json();
        }

        if (dataType === 'articles' || dataType === 'all') {
            // بيانات المقالات الطبية
            const articlesData = [
                {
                    title: 'أهمية العناية اليومية بالأسنان',
                    excerpt: 'تعرف على الطرق الصحيحة للعناية بأسنانك يومياً',
                    content: 'المحتوى الكامل للمقالة...',
                    author: 'د. سارة أحمد',
                    date: '2025-11-01',
                    category: 'وقاية',
                    is_published: true,
                    views_count: 0
                },
                {
                    title: 'تقويم الأسنان: دليل شامل',
                    excerpt: 'كل ما تحتاج معرفته عن تقويم الأسنان وأنواعه',
                    content: 'المحتوى الكامل للمقالة...',
                    author: 'د. محمد علي',
                    date: '2025-10-28',
                    category: 'تقويم',
                    is_published: true,
                    views_count: 0
                },
                {
                    title: 'زراعة الأسنان: التقنيات الحديثة',
                    excerpt: 'أحدث التقنيات في مجال زراعة الأسنان',
                    content: 'المحتوى الكامل للمقالة...',
                    author: 'د. فاطمة حسن',
                    date: '2025-10-25',
                    category: 'زراعة',
                    is_published: true,
                    views_count: 0
                }
            ];

            const articlesResponse = await fetch(`${supabaseUrl}/rest/v1/articles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(articlesData)
            });

            if (!articlesResponse.ok) {
                const errorText = await articlesResponse.text();
                throw new Error(`Failed to seed articles: ${errorText}`);
            }

            const articlesResult = await articlesResponse.json();
            result = { ...result, articles: articlesResult };
        }

        if (dataType === 'products' || dataType === 'all') {
            // بيانات المنتجات الطبية
            const productsData = [
                {
                    name: 'جهاز أشعة رقمي',
                    supplier_id: '1',
                    supplier_name: 'شركة الأدوات الطبية العراقية',
                    category: 'أجهزة',
                    price: 67500000,
                    description: 'جهاز أشعة رقمي عالي الدقة',
                    stock: 5,
                    is_available: true
                },
                {
                    name: 'قفازات طبية (100 قطعة)',
                    supplier_id: '2',
                    supplier_name: 'مؤسسة الرعاية الطبية العراقية',
                    category: 'مستهلكات',
                    price: 225000,
                    description: 'قفازات طبية معقمة',
                    stock: 200,
                    is_available: true
                },
                {
                    name: 'حشوات تجميلية',
                    supplier_id: '1',
                    supplier_name: 'شركة الأدوات الطبية العراقية',
                    category: 'مواد',
                    price: 1200000,
                    description: 'حشوات تجميلية عالية الجودة',
                    stock: 50,
                    is_available: true
                }
            ];

            const productsResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(productsData)
            });

            if (!productsResponse.ok) {
                const errorText = await productsResponse.text();
                throw new Error(`Failed to seed products: ${errorText}`);
            }

            const productsResult = await productsResponse.json();
            result = { ...result, products: productsResult };
        }

        if (dataType === 'jobs' || dataType === 'all') {
            // بيانات الوظائف
            const jobsData = [
                {
                    title: 'طبيب أسنان - بغداد',
                    company_name: 'عيادة النور',
                    location: 'بغداد',
                    job_type: 'دوام كامل',
                    salary_range: '2,250,000 - 3,000,000 د.ع',
                    description: 'نبحث عن طبيب أسنان خبرة 3 سنوات',
                    posted_date: '2025-11-01',
                    is_active: true
                },
                {
                    title: 'مساعد طبيب أسنان - البصرة',
                    company_name: 'مركز الابتسامة',
                    location: 'البصرة',
                    job_type: 'دوام كامل',
                    salary_range: '750,000 - 1,050,000 د.ع',
                    description: 'فرصة عمل لمساعد طبيب أسنان',
                    posted_date: '2025-10-30',
                    is_active: true
                }
            ];

            const jobsResponse = await fetch(`${supabaseUrl}/rest/v1/jobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(jobsData)
            });

            if (!jobsResponse.ok) {
                const errorText = await jobsResponse.text();
                throw new Error(`Failed to seed jobs: ${errorText}`);
            }

            const jobsResult = await jobsResponse.json();
            result = { ...result, jobs: jobsResult };
        }

        return new Response(JSON.stringify({ 
            data: result,
            message: `Data seeded successfully for ${dataType}` 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Seed data error:', error);

        const errorResponse = {
            error: {
                code: 'SEED_DATA_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
