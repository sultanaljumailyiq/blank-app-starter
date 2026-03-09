import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorRole: 'doctor' | 'supplier' | 'admin'
  content: string
  likes: number
  comments: number
  date: string
  imageUrl?: string
  isPublic: boolean
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setPosts(data || [])
    } catch (err: any) {
      console.error('خطأ في جلب منشورات المجتمع:', err)
      setError('فشل في جلب منشورات المجتمع')
    } finally {
      setLoading(false)
    }
  }

  async function createPost(content: string, imageUrl?: string) {
    try {
      // في التطبيق الحقيقي، ستستخدم المستخدم الحالي
      const currentUser = { id: 'anonymous', name: 'مستخدم مجهول', role: 'doctor' }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: currentUser.id,
          author_name: currentUser.name,
          author_role: currentUser.role,
          content,
          image_url: imageUrl,
          is_public: true
        })
        .select()
        .single()

      if (error) throw error

      await fetchPosts() // إعادة تحميل المنشورات
      return data
    } catch (err: any) {
      console.error('خطأ في إنشاء المنشور:', err)
      throw err
    }
  }

  async function likePost(postId: string) {
    try {
      const { error } = await supabase.rpc('increment_likes', { post_id: postId })
      if (error) throw error
      await fetchPosts()
    } catch (err: any) {
      console.error('خطأ في الإعجاب:', err)
      throw err
    }
  }

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    likePost
  }
}
