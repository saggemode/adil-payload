'use server'

import { revalidatePath } from 'next/cache'
import { getMeUser } from '@/utilities/getMeUser'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { IReviewInput } from '@/types'
import { PAGE_SIZE } from '../constants'
import { ReviewInputSchema } from '@/types/validator'
import { formatError } from '@/utilities/generateId'

export async function createUpdateReview({ data, path }: { data: IReviewInput; path: string }) {
    const payload = await getPayload({ config: configPromise })
  
    try {
     const { user } = await getMeUser()
    if (!user) {
      throw new Error('User is not authenticated')
    }

    const review = ReviewInputSchema.parse({
      ...data,
      user: user?.id,
    })

   const existingReview = await payload.find({
     collection: 'reviews',
     where: {
       product: { equals: review.product.toString() }, // Convert number to string
       user: { equals: review.user },
     },
   })


    if (existingReview.docs.length > 0 && existingReview.docs[0]) {
  const reviewId = existingReview.docs[0].id; // Now it's safe to access
  await payload.update({
    collection: 'reviews',
    id: reviewId,
    data: {
      comment: review.comment,
      rating: review.rating,
      title: review.title,
    },
  });
  await updateProductReview(review.product.toString());
  revalidatePath(path);
  return { success: true, message: 'Review updated successfully' };
}

     else {
      await payload.create({ collection: 'reviews', data: review })
      await updateProductReview(review.product.toString())
      revalidatePath(path)
      return { success: true, message: 'Review created successfully' }
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}



const updateProductReview = async (productId: string) => {
      const payload = await getPayload({ config: configPromise })
    
  const reviews = await payload.find({
    collection: 'reviews',
    where: { product: { equals: productId } },
  })

  const totalReviews = reviews.totalDocs
  const avgRating =
    totalReviews > 0
      ? reviews.docs.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: reviews.docs.filter((review) => review.rating === i + 1).length,
  }))

  await payload.update({
    collection: 'products',
    id: productId,
    data: {
      avgRating: parseFloat(avgRating.toFixed(1)),
      numReviews: totalReviews,
      ratingDistribution,
    },
  })
}

export async function getReviews({
  productId,
  limit,
  //page,
}: {
  productId: string
  limit?: number
  page: number
}) {
  limit = limit || PAGE_SIZE
    const payload = await getPayload({ config: configPromise })
  
  const reviews = await payload.find({
    collection: 'reviews',
    where: { product: { equals: productId } },
    sort: '-createdAt',
    limit,
  
  })

  return {
    data: reviews.docs,
    totalPages: reviews.totalDocs === 0 ? 1 : Math.ceil(reviews.totalDocs / limit),
  }
}

export async function getReviewByProductId({ productId }: { productId: string }) {
  const { user } = await getMeUser()
  if (!user) {
    throw new Error('User is not authenticated')
  }
  const payload = await getPayload({ config: configPromise })

  const review = await payload.find({
    collection: 'reviews',
    where: {
      product: { equals: productId },
      user: { equals: user.id },
    },
  })

  return review.docs.length > 0 ? review.docs[0] : null
}
