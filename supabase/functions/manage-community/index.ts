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
        const { action, postData, postId, userId } = await req.json();

        // التحقق من المعرف
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'create_post':
                // إنشاء منشور جديد
                const insertData = {
                    author_id: postData.authorId || 'anonymous',
                    author_name: postData.authorName || 'مستخدم مجهول',
                    author_role: postData.authorRole || 'doctor',
                    content: postData.content,
                    image_url: postData.imageUrl || null,
                    is_public: true,
                    likes: 0,
                    comments: 0
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/community_posts`, {
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
                    throw new Error(`Failed to create post: ${errorText}`);
                }

                result = await insertResponse.json();
                break;

            case 'get_posts':
                // جلب المنشورات
                let getUrl = `${supabaseUrl}/rest/v1/community_posts?select=*&is_public=eq.true&order=created_at.desc`;
                
                if (postId) {
                    getUrl += `&id=eq.${postId}`;
                }
                
                if (userId) {
                    getUrl += `&author_id=eq.${userId}`;
                }

                const getResponse = await fetch(getUrl, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!getResponse.ok) {
                    const errorText = await getResponse.text();
                    throw new Error(`Failed to fetch posts: ${errorText}`);
                }

                result = await getResponse.json();
                break;

            case 'increment_likes':
                // زيادة عدد الإعجابات
                if (!postId) {
                    throw new Error('Post ID is required for increment likes');
                }

                // جلب العدد الحالي للإعجابات
                const currentPostResponse = await fetch(`${supabaseUrl}/rest/v1/community_posts?id=eq.${postId}&select=likes`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!currentPostResponse.ok) {
                    throw new Error('Failed to fetch current likes count');
                }

                const currentData = await currentPostResponse.json();
                const currentLikes = currentData[0]?.likes || 0;

                const likesResponse = await fetch(`${supabaseUrl}/rest/v1/community_posts?id=eq.${postId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        likes: currentLikes + 1
                    })
                });

                if (!likesResponse.ok) {
                    const errorText = await likesResponse.text();
                    throw new Error(`Failed to increment likes: ${errorText}`);
                }

                result = { success: true, newLikesCount: currentLikes + 1 };
                break;

            case 'add_comment':
                // إضافة تعليق
                if (!postId) {
                    throw new Error('Post ID is required for comment');
                }

                const commentData = {
                    post_id: postId,
                    author_id: postData.authorId || 'anonymous',
                    author_name: postData.authorName || 'مستخدم مجهول',
                    content: postData.comment,
                    is_public: true
                };

                const commentResponse = await fetch(`${supabaseUrl}/rest/v1/post_comments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(commentData)
                });

                if (!commentResponse.ok) {
                    const errorText = await commentResponse.text();
                    throw new Error(`Failed to add comment: ${errorText}`);
                }

                // زيادة عدد التعليقات
                const currentPostResponse2 = await fetch(`${supabaseUrl}/rest/v1/community_posts?id=eq.${postId}&select=comments`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                const currentData2 = await currentPostResponse2.json();
                const currentComments = currentData2[0]?.comments || 0;

                await fetch(`${supabaseUrl}/rest/v1/community_posts?id=eq.${postId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comments: currentComments + 1
                    })
                });

                result = await commentResponse.json();
                break;

            case 'delete_post':
                // حذف منشور
                if (!postId) {
                    throw new Error('Post ID is required for delete');
                }

                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/community_posts?id=eq.${postId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_public: false
                    })
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    throw new Error(`Failed to delete post: ${errorText}`);
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
        console.error('Community management error:', error);

        const errorResponse = {
            error: {
                code: 'COMMUNITY_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
