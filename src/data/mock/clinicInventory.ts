// بيانات المخزون لكل عيادة
export interface InventoryItem {
  id: string;
  clinicId: string;
  name: string;
  category: 'equipment' | 'consumables' | 'medicines' | 'instruments' | 'supplies';
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  expiryDate?: string;
  unitPrice: number;
  quantity: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'damaged' | 'maintenance';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  warranty?: {
    provider: string;
    expiry: string;
    type: string;
  };
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes: string;
  image?: string;
  barcode?: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  autoReorder: boolean;
  reorderQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  clinicId: string;
  orderNumber: string;
  orderDate: string;
  expectedDate: string;
  supplier: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  approvedBy?: string;
  notes: string;
}

export const clinicInventoryData: { [clinicId: string]: InventoryItem[] } = {
  '1': [
    {
      id: 'inv1-1',
      clinicId: '1',
      name: 'جهاز تصوير بانورامي',
      category: 'equipment',
      type: 'أجهزة التصوير',
      brand: 'Planmeca',
      model: 'ProX 3D',
      serialNumber: 'PMX-2024-001',
      purchaseDate: '2024-01-15',
      unitPrice: 45000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      location: 'غرفة التصوير',
      status: 'available',
      condition: 'excellent',
      warranty: {
        provider: 'شركة الرائدة للتجهيزات الطبية',
        expiry: '2027-01-15',
        type: 'ضمان شامل'
      },
      lastMaintenance: '2024-11-20',
      nextMaintenance: '2025-02-20',
      notes: 'جهاز تصوير متطور، يحتاج صيانة دورية',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    },
    {
      id: 'inv1-2',
      clinicId: '1',
      name: 'ملقط تقويم',
      category: 'instruments',
      type: 'أدوات التقويم',
      brand: 'Dentaurum',
      model: 'Premium',
      serialNumber: 'DR-2024-002',
      purchaseDate: '2024-03-10',
      unitPrice: 250000,
      quantity: 15,
      minStock: 5,
      maxStock: 30,
      supplier: 'شركة متخصصة في أدوات الأسنان',
      location: 'صندوق أدوات التقويم',
      status: 'available',
      condition: 'good',
      lastMaintenance: '2024-12-01',
      nextMaintenance: '2025-03-01',
      notes: 'أدوات أساسية للتقويم، تحتاج تعقيم دوري',
      usageFrequency: 'daily',
      autoReorder: true,
      reorderQuantity: 10
    },
    {
      id: 'inv1-3',
      clinicId: '1',
      name: 'مخدر موضعي',
      category: 'medicines',
      type: 'التخدير',
      brand: 'Septodont',
      model: 'Lidocaine 2%',
      purchaseDate: '2024-11-20',
      expiryDate: '2026-11-20',
      unitPrice: 15000,
      quantity: 50,
      minStock: 20,
      maxStock: 100,
      supplier: 'شركة أدوية الأسنان',
      location: 'خزانة الأدوية',
      status: 'available',
      condition: 'excellent',
      notes: 'مخدر آمن وفعال، يحتاج حفظ في درجة حرارة مناسبة',
      usageFrequency: 'daily',
      autoReorder: true,
      reorderQuantity: 30
    },
    {
      id: 'inv1-4',
      clinicId: '1',
      name: 'قفازات لاتكس',
      category: 'consumables',
      type: 'مستلزمات الحماية',
      brand: 'Ansell',
      model: 'Microflex 93-260',
      purchaseDate: '2024-12-01',
      expiryDate: '2026-12-01',
      unitPrice: 2500,
      quantity: 500,
      minStock: 200,
      maxStock: 1000,
      supplier: 'شركة متطلبات طبية',
      location: 'مستودع مستلزمات',
      status: 'low_stock',
      condition: 'good',
      notes: 'قفازات عالية الجودة، تحتاج إعادة طلب عند النقص',
      usageFrequency: 'daily',
      autoReorder: true,
      reorderQuantity: 500
    }
  ],
  '2': [
    {
      id: 'inv2-1',
      clinicId: '2',
      name: 'معدات أطفال',
      category: 'equipment',
      type: 'أجهزة الأطفال',
      brand: 'Chesapeake',
      model: 'Pediatric Suite',
      purchaseDate: '2024-02-10',
      unitPrice: 15000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      location: 'غرفة الأطفال',
      status: 'available',
      condition: 'excellent',
      lastMaintenance: '2024-10-15',
      nextMaintenance: '2025-01-15',
      notes: 'معدات مصممة خصيصاً للأطفال',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    },
    {
      id: 'inv2-2',
      clinicId: '2',
      name: 'ألعاب تعليمية',
      category: 'supplies',
      type: 'ألعاب الأطفال',
      brand: 'Sesame Street',
      model: 'Dental Education Kit',
      purchaseDate: '2024-04-20',
      unitPrice: 75000,
      quantity: 10,
      minStock: 3,
      maxStock: 20,
      supplier: 'شركة ألعاب طبية',
      location: 'غرفة الانتظار',
      status: 'available',
      condition: 'good',
      notes: 'ألعاب تعليمية لتخفيف خوف الأطفال من طبيب الأسنان',
      usageFrequency: 'daily',
      autoReorder: true,
      reorderQuantity: 5
    }
  ],
  '3': [
    {
      id: 'inv3-1',
      clinicId: '3',
      name: 'جهاز زراعة متقدم',
      category: 'equipment',
      type: 'أجهزة الزرع',
      brand: 'Nobel Biocare',
      model: 'Guide Implant System',
      serialNumber: 'NB-2024-003',
      purchaseDate: '2024-01-20',
      unitPrice: 85000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة تقنيات طبية',
      location: 'غرفة الجراحة',
      status: 'available',
      condition: 'excellent',
      warranty: {
        provider: 'شركة تقنيات طبية',
        expiry: '2027-01-20',
        type: 'ضمان شامل'
      },
      lastMaintenance: '2024-11-25',
      nextMaintenance: '2025-02-25',
      notes: 'جهاز زراعة متطور ودقيق',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    }
  ],
  '4': [
    {
      id: 'inv4-1',
      clinicId: '4',
      name: 'معدات وقاية الأطفال',
      category: 'equipment',
      type: 'معدات الوقاية',
      brand: 'Pediatric Care',
      model: 'Protection Kit',
      purchaseDate: '2024-05-15',
      unitPrice: 3500000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      location: 'غرفة الأطفال',
      status: 'available',
      condition: 'good',
      lastMaintenance: '2024-09-10',
      nextMaintenance: '2025-03-10',
      notes: 'معدات وقاية خاصة بالأطفال',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    }
  ],
  '5': [
    {
      id: 'inv5-1',
      clinicId: '5',
      name: 'مسح رقمي متقدم',
      category: 'equipment',
      type: 'أجهزة المسح',
      brand: '3Shape',
      model: 'TRIOS 4',
      serialNumber: '3S-2024-004',
      purchaseDate: '2024-03-05',
      unitPrice: 65000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة تقنيات طبية',
      location: 'غرفة التصوير',
      status: 'available',
      condition: 'excellent',
      warranty: {
        provider: 'شركة تقنيات طبية',
        expiry: '2026-03-05',
        type: 'ضمان شامل'
      },
      lastMaintenance: '2024-12-01',
      nextMaintenance: '2025-06-01',
      notes: 'مسح رقمي ثلاثي الأبعاد دقيق',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    }
  ],
  '6': [
    {
      id: 'inv6-1',
      clinicId: '6',
      name: 'معدات أسنان عامة',
      category: 'equipment',
      type: 'معدات عامة',
      brand: 'A-dec',
      model: '500 Series',
      purchaseDate: '2024-01-30',
      unitPrice: 12000000,
      quantity: 3,
      minStock: 1,
      maxStock: 5,
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      location: 'صالة العلاج',
      status: 'available',
      condition: 'good',
      lastMaintenance: '2024-10-20',
      nextMaintenance: '2025-04-20',
      notes: 'معدات عامة عادية الاستخدام',
      usageFrequency: 'daily',
      autoReorder: true,
      reorderQuantity: 2
    }
  ],
  '7': [
    {
      id: 'inv7-1',
      clinicId: '7',
      name: 'مجمع جراحة متقدم',
      category: 'equipment',
      type: 'معدات الجراحة',
      brand: 'Sirona',
      model: 'InFire HP',
      serialNumber: 'SR-2024-005',
      purchaseDate: '2024-02-15',
      unitPrice: 120000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة تقنيات طبية',
      location: 'غرفة الجراحة',
      status: 'available',
      condition: 'excellent',
      warranty: {
        provider: 'شركة تقنيات طبية',
        expiry: '2027-02-15',
        type: 'ضمان شامل'
      },
      lastMaintenance: '2024-11-15',
      nextMaintenance: '2025-02-15',
      notes: 'أحدث معدات الجراحة في المنطقة',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    }
  ],
  '8': [
    {
      id: 'inv8-1',
      clinicId: '8',
      name: 'معدات أطفال متقدمة',
      category: 'equipment',
      type: 'معدات الأطفال',
      brand: 'Patterson Dental',
      model: 'Child-Safe Suite',
      purchaseDate: '2024-04-10',
      unitPrice: 18000000,
      quantity: 1,
      minStock: 0,
      maxStock: 1,
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      location: 'غرفة الأطفال',
      status: 'available',
      condition: 'excellent',
      lastMaintenance: '2024-11-30',
      nextMaintenance: '2025-05-30',
      notes: 'معدات متخصصة للأطفال مع ميزات أمان إضافية',
      usageFrequency: 'daily',
      autoReorder: false,
      reorderQuantity: 0
    }
  ]
};

export const clinicPurchaseOrdersData: { [clinicId: string]: PurchaseOrder[] } = {
  '1': [
    {
      id: 'po1-1',
      clinicId: '1',
      orderNumber: 'PO-2024-001',
      orderDate: '2024-12-01',
      expectedDate: '2024-12-15',
      supplier: 'شركة الرائدة للتجهيزات الطبية',
      items: [
        { itemId: 'inv1-2', quantity: 10, unitPrice: 250000, totalPrice: 2500000 },
        { itemId: 'inv1-4', quantity: 500, unitPrice: 2500, totalPrice: 1250000 }
      ],
      totalAmount: 3750000,
      status: 'ordered',
      notes: 'طلب عاجل - إعادة تزويد المخزون'
    },
    {
      id: 'po1-2',
      clinicId: '1',
      orderNumber: 'PO-2024-002',
      orderDate: '2024-12-05',
      expectedDate: '2024-12-20',
      supplier: 'شركة متطلبات طبية',
      items: [
        { itemId: 'inv1-3', quantity: 30, unitPrice: 15000, totalPrice: 450000 }
      ],
      totalAmount: 450000,
      status: 'approved',
      approvedBy: 'د. أحمد محمد',
      notes: 'طلب عادي - تجديد المخزون'
    }
  ],
  '2': [
    {
      id: 'po2-1',
      clinicId: '2',
      orderNumber: 'PO-2024-001',
      orderDate: '2024-11-25',
      expectedDate: '2024-12-10',
      supplier: 'شركة ألعاب طبية',
      items: [
        { itemId: 'inv2-2', quantity: 5, unitPrice: 75000, totalPrice: 375000 }
      ],
      totalAmount: 375000,
      status: 'delivered',
      approvedBy: 'د. فاطمة رشيد',
      notes: 'تم التسليم بنجاح'
    }
  ]
};

// دالة للحصول على مخزون العيادة
export const getInventoryByClinic = (clinicId: string): InventoryItem[] => {
  return clinicInventoryData[clinicId] || [];
};

// دالة للبحث في المخزون
export const searchInventory = (clinicId: string, query: string): InventoryItem[] => {
  const inventory = getInventoryByClinic(clinicId);
  return inventory.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase()) ||
    item.brand?.toLowerCase().includes(query.toLowerCase()) ||
    item.supplier.toLowerCase().includes(query.toLowerCase())
  );
};

// دالة للحصول على طلبات الشراء
export const getPurchaseOrdersByClinic = (clinicId: string): PurchaseOrder[] => {
  return clinicPurchaseOrdersData[clinicId] || [];
};

// دالة للحصول على إحصائيات المخزون
export const getInventoryStats = (clinicId: string) => {
  const inventory = getInventoryByClinic(clinicId);
  const totalValue = inventory.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  return {
    totalItems: inventory.length,
    totalValue: totalValue,
    available: inventory.filter(i => i.status === 'available').length,
    lowStock: inventory.filter(i => i.status === 'low_stock').length,
    outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
    expired: inventory.filter(i => i.status === 'expired').length,
    damaged: inventory.filter(i => i.status === 'damaged').length,
    maintenance: inventory.filter(i => i.status === 'maintenance').length,
    equipment: inventory.filter(i => i.category === 'equipment').length,
    consumables: inventory.filter(i => i.category === 'consumables').length,
    medicines: inventory.filter(i => i.category === 'medicines').length,
    instruments: inventory.filter(i => i.category === 'instruments').length,
    supplies: inventory.filter(i => i.category === 'supplies').length,
    totalPurchaseOrders: Object.values(clinicPurchaseOrdersData).flat().filter(po => po.clinicId === clinicId).length,
    pendingOrders: Object.values(clinicPurchaseOrdersData).flat().filter(po => 
      po.clinicId === clinicId && po.status === 'pending'
    ).length,
    totalOrderValue: Object.values(clinicPurchaseOrdersData).flat().filter(po => po.clinicId === clinicId)
      .reduce((sum, po) => sum + po.totalAmount, 0)
  };
};

// دالة للحصول على العناصر منخفضة المخزون
export const getLowStockItems = (clinicId: string): InventoryItem[] => {
  return getInventoryByClinic(clinicId).filter(item => 
    item.quantity <= item.minStock && item.status !== 'out_of_stock'
  );
};

// دالة للحصول على العناصر منتهية الصلاحية
export const getExpiringItems = (clinicId: string, days: number = 30): InventoryItem[] => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return getInventoryByClinic(clinicId).filter(item => 
    item.expiryDate && new Date(item.expiryDate) <= futureDate
  );
};

// دالة لحساب قيمة المخزون
export const calculateInventoryValue = (clinicId: string): number => {
  return getInventoryByClinic(clinicId).reduce((total, item) => 
    total + (item.unitPrice * item.quantity), 0
  );
};