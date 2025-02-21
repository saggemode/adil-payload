import * as z from 'zod'
//import { PAYMENT_METHODS } from '@/constants/constant'
//import { formatNumberWithDecimal } from '@/lib/utils'

const UserName = z
  .string()
  .min(2, { message: 'Username must be at least 2 characters' })
  .max(50, { message: 'Username must be at most 30 characters' })
// const Email = z.string().min(1, 'Email is required').email('Email is invalid')
// const Password = z.string().min(3, 'Password must be at least 3 characters')
// const UserRole = z.string().min(1, 'role is required')

export const UserNameSchema = z.object({
  name: UserName,
})

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
   // role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    phone: z.optional(z.string()),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false
      }

      return true
    },
    {
      message: 'New password is required!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }

      return true
    },
    {
      message: 'Password is required!',
      path: ['password'],
    }
  )


export type SettingsSchemaType = z.infer<typeof SettingsSchema>

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum of 6 characters required',
  }),
})

export type NewPasswordSchemaType = z.infer<typeof NewPasswordSchema>

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
})

export const RecoverSchema = z.object({
  password: z.string().min(1, {
    message: 'Password is required',
  }),
})

export type ResetSchemaType = z.infer<typeof ResetSchema>

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>


export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
})

export type RegisterSchemaType = z.infer<typeof RegisterSchema>

export const BannerSchema = z.object({
  label: z.string().min(4, {
    message: 'Minimum 6 characters required',
  }),
  imageUrl: z.string().min(1),
})

export const CategorySchema = z.object({
  title: z.string().min(1, {
    message: 'Minimum 1 characters required',
  }),
})

export const BrandSchema = z.object({
  name: z.string().min(1, {
    message: 'Brand is required',
  }),
})

export const SizeSchema = z.object({
  name: z.string().min(1, {
    message: 'Minimum 1 characters required',
  }),

  value: z.string().min(1, {
    message: 'Minimum 1 characters required',
  }),
})

export const ColorSchema = z.object({
  name: z.string().min(2, {
    message: 'Minimum 1 characters required',
  }),

  value: z.string().min(4).max(9).regex(/^#/, {
    message: 'String must be a valid hex code',
  }),
})

// const MAX_FILE_SIZE = 10000000
// const ACCEPTED_IMAGE_TYPES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/webp',
// ]
export const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  stock: z.coerce.number().min(1),
  description: z.string().min(1),
  discount: z.coerce.number().optional(),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  brandId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
})

export const productActionSchema = z.object({
  ...ProductSchema.shape, // Spread all fields from ProductSchema
})

export const updateProductActionSchema = z.object({
  ...ProductSchema.shape,
  id: z.string(),
})

export const deleteProductActionSchema = z.object({
  id: z.string(),
})

export const updateProductStatusActionSchema = z.object({
  id: z.string(),
  isFeatured: z.boolean().default(false).optional(),
  //status: z.enum(["ACTIVE", "DRAFT"]),
})

// const OptionValueSchema = z.object({
//   id: z.number(),
//   name: z.string(),
//   price: z.number(),
//   stock: z.number(),
//   variantId: z.number(),
// })

// const VariantSchema = z.object({
//   id: z.number(),
//   name: z.string(),
//   productId: z.number(),
//   optionValues: z.array(OptionValueSchema), // Add this line
// })

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(3, 'city must be at least 3 characters'),
  postalCode: z.string().optional(),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  lat: z.number().optional(),
  lng: z.number().optional(),
})


export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
})

export const insertReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z.string(),
  description: z.string(),
  productId: z.string(),
  userId: z.string(),
})

export const insertOrderSchema = z.object({
  userId: z.string(),
  paymentMethod: z.string(),
  shippingAddress: shippingAddressSchema,
  items: z.array(
    z.object({
      id: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  itemsPrice: z.number(),
  totalPrice: z.number(),
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
      pricePaid: z.string(),
    })
    .optional(),
})

export const insertOrderItemSchema = z.object({
  price: z.number(),
})

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  quantity: z
    .number()
    .int()
    .nonnegative('Quantity must be a non-negative number'),
  image: z.string().min(1, 'Image is required'),
  // price: z
  //   .number()
  //   .refine(
  //     (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
  //     'Price must have exactly two decimal places (e.g., 49.99)'
  //   ),
})

export const CartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(), // nullable to match the foreign key that could be null
  sessionCartId: z.string(),
  items: z.array(cartItemSchema).default([]),
  // itemsPrice: z.number(),
  // shippingPrice: z.number(),
  // taxPrice: z.number(),
  totalPrice: z.number(),
  createdAt: z.date().default(new Date()),
})

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().min(11, 'Phone must be at least 11 characters'),
  email: z.string().email().min(3, 'Email must be at least 3 characters'),
})

export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'Id is required'),
  role: z.string().min(1, 'Role is required'),
})


