import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Article } from '../types'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // تحويل تنسيق البيانات
      const formattedArticles = data?.map(article => ({
        id: article.id.toString(),
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        date: article.date,
        category: article.category
      })) || []

      setArticles(formattedArticles)

    } catch (err: any) {
      console.error('Error fetching articles:', err)
      setError('فشل تحميل المقالات')
    } finally {
      setLoading(false)
    }
  }

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles
  }
}

export function useArticle(id: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])

  async function fetchArticle() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        const formattedArticle = {
          id: data.id.toString(),
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          author: data.author,
          date: data.date,
          category: data.category
        }
        setArticle(formattedArticle)
      } else {
        setArticle(null)
      }
    } catch (err: any) {
      console.error('Error fetching article:', err)
      setError('فشل تحميل المقال')
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    article,
    loading,
    error,
    refetch: fetchArticle
  }
}
