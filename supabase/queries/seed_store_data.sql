
-- Insert a Supplier if none exists
INSERT INTO suppliers (id, company_name, description, city, phone, status, rating, is_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'شركة المورد (تجريبي)',
    'مورد معتمد لمواد طب الأسنان',
    'بغداد',
    '07700000000',
    'approved',
    4.9,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert Brands
INSERT INTO brands (id, name, description) VALUES
('b1', '3M ESPE', 'High quality dental products'),
('b2', 'GC Dental', 'Japanese precision')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (
    id, supplier_id, brand_id, name, description, 
    price, stock, category, image_url, 
    is_active, is_featured, is_new, rating
) VALUES 
(
    'p1', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'b1',
    'حشوة ضوئية 3M Filtek Z250',
    'حشوة ضوئية عالمية عالية الجودة تستخدم لجميع الفئات.',
    45000, 
    100, 
    'المواد الاستهلاكية',
    'https://m.media-amazon.com/images/I/61+yVwXXg+L._AC_UF1000,1000_QL80_.jpg',
    true,
    true,
    true,
    4.8
),
(
    'p2', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'b2',
    'مادة طبعة GC Fuji I',
    'إسمنت زجاجي أيوني للتركيبات الدائمية.',
    35000, 
    50, 
    'المواد الاستهلاكية',
    'https://www.gc.dental/america/sites/default/files/styles/product_large/public/2021-03/Fuji-I-GC-America.jpg?itok=z6q-Xqq-',
    true,
    false,
    true,
    4.5
),
(
    'p3', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'b1',
    'جهاز تبييض الأسنان Zoom',
    'جهاز تبييض احترافي للعيادات.',
    1200000, 
    5, 
    'الأجهزة والمعدات',
    'https://m.media-amazon.com/images/I/51p8K6yqJAL._AC_SL1000_.jpg',
    true,
    true,
    false,
    5.0
)
ON CONFLICT (id) DO UPDATE SET is_active = true;
