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
        const { action, articleData, articleId, category } = await req.json();

        // التحقق من المعرف
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'create':
                // إنشاء مقال جديد
                const insertData = {
                    title: articleData.title,
                    excerpt: articleData.excerpt,
                    content: articleData.content,
                    author: articleData.author,
                    date: articleData.date,
                    category: articleData.category,
                    is_published: true,
                    views_count: 0
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/articles`, {
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
                    throw new Error(`Failed to create article: ${errorText}`);
                }

                result = await insertResponse.json();
                break;

            case 'update':
                // تحديث مقال
                if (!articleId) {
                    throw new Error('Article ID is required for update');
                }

                const updateData = {
                    title: articleData.title,
                    excerpt: articleData.excerpt,
                    content: articleData.content,
                    author: articleData.author,
                    date: articleData.date,
                    category: articleData.category,
                    updated_at: new Date().toISOString()
                };

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${articleId}`, {
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
                    throw new Error(`Failed to update article: ${errorText}`);
                }

                result = await updateResponse.json();
                break;

            case 'get':
                // جلب المقالات
                let getUrl = `${supabaseUrl}/rest/v1/articles?select=*&is_published=eq.true&order=date.desc`;
                
                if (articleId) {
                    getUrl += `&id=eq.${articleId}`;
                }
                
                if (category) {
                    getUrl += `&category=eq.${category}`;
                }

                const getResponse = await fetch(getUrl, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!getResponse.ok) {
                    const errorText = await getResponse.text();
                    throw new Error(`Failed to fetch articles: ${errorText}`);
                }

                result = await getResponse.json();
                break;

            case 'increment_views':
                // زيادة عدد المشاهدات
                if (!articleId) {
                    throw new Error('Article ID is required for increment views');
                }

                const viewsResponse = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${articleId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        views_count: articleData.views_count + 1
                    })
                });

                if (!viewsResponse.ok) {
                    const errorText = await viewsResponse.text();
                    throw new Error(`Failed to increment views: ${errorText}`);
                }

                result = { success: true };
                break;

            case 'delete':
                // حذف مقال
                if (!articleId) {
                    throw new Error('Article ID is required for delete');
                }

                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${articleId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_published: false,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    throw new Error(`Failed to delete article: ${errorText}`);
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
        console.error('Article management error:', error);

        const errorResponse = {
            error: {
                code: 'ARTICLE_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
