'use server'
import { draftMode } from 'next/headers'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'


import { Category, Product } from '@/payload-types'
import { cache } from 'react'
import { formatError } from '@/utilities/generateId'

// GET ONE PRODUCT BY ID
export async function getProductById(productId: any) {
  const payload = await getPayload({ config: configPromise })

  const product = await payload.findByID({
    collection: 'products',
    id: productId,
  })
  return product
}

// DELETE
export async function deleteProduct(id: any) {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.delete({ collection: 'products', id })
    revalidatePath('/admin/products')
    return { success: true, message: 'Product deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


export async function getProductsByTag({ tag, limit = 10 }: any) {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    where: { tags: { contains: tag }, isPublished: { equals: true } },
    sort: '-createdAt',
    limit,
  })
  return products.docs
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: any) {
  const payload = await getPayload({ config: configPromise })

  const product = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, isPublished: { equals: true } },
  })
  return product.docs[0] || null
}

// GET RELATED PRODUCTS BY CATEGORY
export async function getRelatedProductsByCategory({ category, productId }: any) {
  const payload = await getPayload({ config: configPromise })

  const getCategoryTitle = (categories: number | Category | null | undefined) => {
    if (Array.isArray(categories)) {
      return categories.length > 0 ? categories[0].title : 'Unknown Category'
    }
    if (typeof categories === 'object' && categories?.title) {
      return categories.title
    }
    return 'Unknown Category'
  }

  const products = await payload.find({
    collection: 'products',
    limit: 10,
    pagination: false,
    where: {
      category: getCategoryTitle(category),
      id: { not_equals: productId },
      isPublished: { equals: true },
    },
    sort: '-numSales',
  })

  return products
}

export async function getRelatedProductsByCategory2({
  category,
  productId,
}: {
  category: string
  productId: string
}): Promise<Product[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    where: {
      categories: {
        equals: category,
      },
      id: {
        not_equals: productId,
      },
    },
    limit: 10,
    pagination: false,
  })

  // Return only the `docs` array
  return result.docs || []
}

export const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})



export async function getAllProducts({
  query,
  category,
  tag,
  price,
  rating,
  sort,
  limit,
  page,
}: any) {
  const payload = await getPayload({ config: configPromise })

  // Define filters based on the provided parameters
  const filters = {
    ...(query && query !== 'all' && { title: { contains: query } }), // Use contains for partial matching
    ...(category && category !== 'all' && { category: { equals: category } }),
    ...(tag && tag !== 'all' && { tags: { contains: tag } }),
    ...(price &&
      price !== 'all' && {
        price: {
          greater_than_equal: Number(price.split('-')[0]),
          less_than_equal: Number(price.split('-')[1]),
        },
      }),
    ...(rating && rating !== 'all' && { avgRating: { greater_than_equal: Number(rating) } }),
  }

  // Define sort order based on the provided sort parameter
  const sortOrder =
    sort === 'best-selling'
      ? '-numSales'
      : sort === 'price-low-to-high'
        ? 'price'
        : sort === 'price-high-to-low'
          ? '-price'
          : sort === 'avg-customer-review'
            ? '-avgRating'
            : '-createdAt'

  // Query the Payload CMS collection
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: limit || 12,
    page: page || 1,
    overrideAccess: false,
    where: filters,
    sort: sortOrder,
  })

  return products
}



export async function getAllCategories() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({ collection: 'categories' }) // Fetch from the 'categories' collection
  return categories.docs.map((doc) => doc.title) // Adjust based on the category field structure

  //   return categories.docs.map((doc) => ({
  //    id: doc.id, // Ensure 'id' exists
  //    title: doc.title, // Keep all necessary properties
  //  }))

  //return categories.docs as Category[] // Ensures the correct type is returned
  //return (categories.docs || []) as Category[]
  //return Array.isArray(categories.docs) ? (categories.docs as Category[]) : []
}

// GET ALL TAGS
export async function getAllTags() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1, // Ensure related tags are populated
  })

  const tags = new Set<string>()

  products.docs.forEach((product) => {
    if (Array.isArray(product.tags)) {
      product.tags.forEach((tag) => {
        if (typeof tag === 'object' && tag.title) {
          tags.add(tag.title) // Extract tag titles
        }
      })
    }
  })

  return Array.from(tags)
}

export async function getAllTagExtra() {
  const payload = await getPayload({ config: configPromise })

  const tags = await payload.find({ collection: 'tags' }) // Fetch all tags
  return tags.docs.map((doc) => doc.title) // Adjust field name as needed
}
