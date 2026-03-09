import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { mockProducts } from '../data/mock'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // تحويل تنسيق البيانات
      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        supplierId: product.supplier_id || '',
        supplierName: product.supplier_name || '',
        category: product.category,
        price: product.price,
        description: product.description,
        stock: product.stock
      })) || []

      setProducts(formattedProducts)
    } catch (err: any) {
      console.error('فشل الاتصال بقاعدة البيانات:', err)
      setError('فشل تحميل المنتجات')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  async function fetchProduct() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_available', true)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        const formattedProduct = {
          id: data.id,
          name: data.name,
          supplierId: data.supplier_id || '',
          supplierName: data.supplier_name || '',
          category: data.category,
          price: data.price,
          description: data.description,
          stock: data.stock
        }
        setProduct(formattedProduct)
      } else {
        setProduct(null)
      }
    } catch (err: any) {
      console.error('خطأ في جلب المنتج:', err)
      setError('فشل في جلب المنتج')
    } finally {
      setLoading(false)
    }
  }

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  }
}
