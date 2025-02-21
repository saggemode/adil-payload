import { z } from 'zod'
import { formatNumberWithDecimal } from '../utilities/formatNumberWithDecimal'

// const PayloadId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Payload ID' })

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`,
    )

// Order Item
export const OrderItemSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),

  product: z.number(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative number'),
  countInStock: z.number().int().nonnegative('Count in stock must be a non-negative number'),
  image: z.string().min(1, 'Image is required'),
  price: Price('Price'),
  size: z.string().optional(),
  color: z.string().optional(),
})


export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  street: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  province: z.string().min(1, 'Province is required'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
})

export const CartSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingPrice: z.optional(z.number()),
  totalPrice: z.number(),

  paymentMethod: z.optional(z.string()),
  shippingAddress: z.optional(ShippingAddressSchema),
  deliveryDateIndex: z.optional(z.number()),
  expectedDeliveryDate: z.optional(z.date()),
})


export const OrderInputSchema = z.object({
  user: z.number(),
  //user: z.string(),
  items: z.array(OrderItemSchema),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  itemsPrice: Price('Items price'),
  shippingPrice: Price('Shipping price'),
  taxPrice: Price('Tax price'),
  totalPrice: Price('Total price'),
  expectedDeliveryDate: z
    .string()
    .refine(
      (value) => !isNaN(Date.parse(value)),
      'Expected delivery date must be a valid date string',
    )
    .refine(
      (value) => new Date(value) > new Date(),
      'Expected delivery date must be in the future',
    ),
  expectedDeliveryDate_tz: z.string(), // ✅ Add this line
  isDelivered: z.boolean().default(false),
  deliveredAt: z.string().optional(),
  isPaid: z.boolean().default(false),
  paidAt: z.string().optional(),
})



export type OrderInput = {
  user: string
  items: {
    clientId: string
    product: string
    name: string
    slug: string
    category: string
    quantity: number
    countInStock: number
    image: string
    price: number
    size?: string
    color?: string
  }[]
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  expectedDeliveryDate: string

  id?: string
  sizes?: string[]
  createdAt?: Date
  updatedAt?: Date
  paidAt?: Date
}

// export const ReviewInputSchema = z.object({
//   product: z.number(),
//   user: z.string(),
//   isVerifiedPurchase: z.boolean(),
//   title: z.string().min(1, 'Title is required'),
//   comment: z.string().min(1, 'Comment is required'),
//   rating: z.coerce
//     .number()
//     .int()
//     .min(1, 'Rating must be at least 1')
//     .max(5, 'Rating must be at most 5'),
// })

export const ReviewInputSchema = z.object({
  product: z.number(), // Keep as number if it's stored as a number in the DB
  user: z.number(), // Change from string to number to match expected type
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(1, 'Comment is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
})


export const ProductInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(1, 'Description is required'),
  isPublished: z.boolean(),
  price: Price('Price'),
  listPrice: Price('List price'),
  countInStock: z.coerce.number().int().nonnegative('count in stock must be a non-negative number'),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  avgRating: z.coerce
    .number()
    .min(0, 'Average rating must be at least 0')
    .max(5, 'Average rating must be at most 5'),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative('Number of reviews must be a non-negative number'),
  ratingDistribution: z.array(z.object({ rating: z.number(), count: z.number() })).max(5),
  reviews: z.array(ReviewInputSchema).default([]),
  numSales: z.coerce.number().int().nonnegative('Number of sales must be a non-negative number'),
})

export const ProductUpdateSchema = ProductInputSchema.extend({
  _id: z.string(),
})



