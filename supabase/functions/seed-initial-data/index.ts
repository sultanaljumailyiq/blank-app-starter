Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // إنشاء مستخدم مشرف افتراضي
    const adminEmail = 'admin@smartdental.iq';
    const adminPassword = 'Admin@123456';

    // التحقق من وجود المستخدم
    const checkUser = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    });

    const existingUsers = await checkUser.json();
    const adminExists = existingUsers.users?.some(u => u.email === adminEmail);

    let adminId;
    if (!adminExists) {
      // إنشاء مستخدم مشرف جديد
      const createAdmin = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: 'المشرف الرئيسي',
            role: 'admin'
          }
        }),
      });

      const adminData = await createAdmin.json();
      adminId = adminData.id;
    } else {
      adminId = existingUsers.users.find(u => u.email === adminEmail).id;
    }

    // إضافة بيانات العلاجات
    const treatments = [
      { treatment_name: 'تنظيف أسنان', category: 'prevention', base_price: 50000, duration_minutes: 30, description: 'تنظيف شامل للأسنان وإزالة الجير' },
      { treatment_name: 'حشو عادي', category: 'treatment', base_price: 75000, duration_minutes: 45, description: 'حشو تسوس الأسنان بمواد عالية الجودة' },
      { treatment_name: 'خلع ضرس', category: 'surgery', base_price: 100000, duration_minutes: 30, requires_anesthesia: true, description: 'خلع ضرس بالتخدير الموضعي' },
      { treatment_name: 'تقويم أسنان', category: 'cosmetic', base_price: 500000, duration_minutes: 60, description: 'تركيب تقويم معدني أو شفاف' },
      { treatment_name: 'تبييض أسنان', category: 'cosmetic', base_price: 250000, duration_minutes: 90, description: 'تبييض الأسنان بالليزر' },
      { treatment_name: 'زراعة سن', category: 'surgery', base_price: 800000, duration_minutes: 120, requires_anesthesia: true, description: 'زراعة سن بالتيتانيوم' },
    ];

    await fetch(`${supabaseUrl}/rest/v1/treatments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(treatments),
    });

    // إضافة بيانات الموظفين
    const staff = [
      { full_name: 'د. أحمد محمد', role_title: 'طبيب أسنان', department: 'طب الأسنان', salary: 400000, phone: '+964 770 123 4567', join_date: '2023-01-15' },
      { full_name: 'فاطمة علي', role_title: 'ممرضة', department: 'التمريض', salary: 250000, phone: '+964 771 234 5678', join_date: '2023-03-20' },
      { full_name: 'د. محمود حسن', role_title: 'طبيب أسنان', department: 'طب الأسنان', salary: 380000, phone: '+964 772 345 6789', join_date: '2023-02-10' },
      { full_name: 'نور الدين', role_title: 'مساعد', department: 'الإدارة', salary: 200000, phone: '+964 773 456 7890', join_date: '2023-06-01' },
      { full_name: 'سعاد كاطع', role_title: 'محاسبة', department: 'المالية', salary: 300000, phone: '+964 774 567 8901', join_date: '2023-04-15' },
    ];

    await fetch(`${supabaseUrl}/rest/v1/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(staff),
    });

    // إضافة مخزون
    const inventory = [
      { item_name: 'قفازات طبية', category: 'مستلزمات', quantity: 500, unit_price: 250, min_stock: 100 },
      { item_name: 'حشوات مركبة', category: 'مواد حشو', quantity: 50, unit_price: 15000, min_stock: 20 },
      { item_name: 'إبر تخدير', category: 'أدوية', quantity: 200, unit_price: 500, min_stock: 50 },
      { item_name: 'خيوط جراحية', category: 'جراحة', quantity: 30, unit_price: 8000, min_stock: 10 },
      { item_name: 'معجون أسنان طبي', category: 'منتجات', quantity: 100, unit_price: 3000, min_stock: 30 },
    ];

    await fetch(`${supabaseUrl}/rest/v1/inventory`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(inventory),
    });

    // إضافة أجهزة
    const equipment = [
      { equipment_name: 'جهاز أشعة بانوراما', category: 'تشخيص', purchase_price: 8000000, purchase_date: '2023-01-10', condition: 'excellent' },
      { equipment_name: 'كرسي أسنان كهربائي', category: 'أساسي', purchase_price: 5500000, purchase_date: '2023-02-15', condition: 'excellent' },
      { equipment_name: 'جهاز تعقيم أوتوكلاف', category: 'تعقيم', purchase_price: 2200000, purchase_date: '2023-03-01', condition: 'good' },
      { equipment_name: 'جهاز تبييض ليزر', category: 'تجميل', purchase_price: 2000000, purchase_date: '2023-04-20', condition: 'excellent' },
    ];

    await fetch(`${supabaseUrl}/rest/v1/equipment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(equipment),
    });

    // إضافة سجلات مالية (آخر 6 أشهر)
    const currentDate = new Date();
    const financialRecords = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const baseRevenue = 1200000 + Math.floor(Math.random() * 400000);
      const baseExpenses = 700000 + Math.floor(Math.random() * 300000);
      
      financialRecords.push({
        record_date: date.toISOString().split('T')[0],
        record_month: date.getMonth() + 1,
        record_year: date.getFullYear(),
        revenue: baseRevenue,
        expenses: baseExpenses,
        revenue_sources: { appointments: baseRevenue * 0.7, treatments: baseRevenue * 0.3 },
        expense_categories: { salaries: baseExpenses * 0.5, supplies: baseExpenses * 0.3, utilities: baseExpenses * 0.2 }
      });
    }

    await fetch(`${supabaseUrl}/rest/v1/financial_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(financialRecords),
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'تم تهيئة البيانات الأولية بنجاح',
      admin_credentials: {
        email: adminEmail,
        password: adminPassword,
        note: 'يرجى تغيير كلمة المرور بعد أول تسجيل دخول'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
