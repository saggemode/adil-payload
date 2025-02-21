import {
  CartSchema,
  OrderInputSchema,
  OrderItemSchema,
  ShippingAddressSchema,
  ReviewInputSchema,
} from '@/types/validator'
import { z } from 'zod'

export type OrderItem = z.infer<typeof OrderItemSchema>
export type Cart = z.infer<typeof CartSchema>
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>
export type IOrderInput = z.infer<typeof OrderInputSchema>

export type IReviewInput = z.infer<typeof ReviewInputSchema>


export type IReviewDetails = {
  id: string
  product: string
  user: {
    name: string
  }
  isVerifiedPurchase: boolean
  rating: number
  title: string
  comment: string
  updatedAt: string
  createdAt: string
}
export type Data = {
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}

export type Product = {
  id: number
  name: string
  // other fields...
}

export type OrderItems = {
  product: number | Product
  clientId: string
  name: string
  slug: string
  category: string
  quantity: number
  countInStock: number
  image: string
  price: number
  size?: string
  color?: string
}

export type Order = {
  sizes: string[]
  id: string
  createdAt: Date
  updatedAt: Date
  items: OrderItems[]
  // other fields...
}