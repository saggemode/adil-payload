import { admins } from '@/access/admins'
// import { authenticated } from '../../access/authenticated'
// import { Banner } from '../../blocks/Banner/config'
// import { Code } from '../../blocks/Code/config'
// import { MediaBlock } from '../../blocks/MediaBlock/config'
// import { generatePreviewPath } from '../../utilities/generatePreviewPath'
// import { CallToAction } from '@/blocks/CallToAction/config'
// import { Content } from '@/blocks/Content/config'
// import { Archive } from '@/blocks/ArchiveBlock/config'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { adminsOrLoggedIn } from '@/access/adminsOrLoggedIn'
import type { CollectionConfig } from 'payload'
// import { populateOrderedBy } from './hooks/populateOrderedBy'
// import { LinkToPaymentIntent } from './ui/LinkToPaymentIntent'
// import { updateUserPurchases } from './hooks/updateUserPurchases'
// import { clearUserCart,  } from './hooks/clearUserCart'
// import { updateProductStock } from './hooks/updateProductStock'
// import { sendOrderConfirmationEmail } from './hooks/sendOrderConfirmationEmail'

export const Orders: CollectionConfig = {
  slug: 'orders',
  // hooks: {
  //   afterChange: [updateProductStock, sendOrderConfirmationEmail],
  // },
  access: {
    read: adminsOrOrderedBy,
    update: admins,
    create: adminsOrLoggedIn,
    delete: admins,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // hooks: {
      //   beforeChange: [populateOrderedBy],
      // },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'clientId',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
        {
          name: 'countInStock',
          type: 'number',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'color',
          type: 'text',
        },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          required: true,
        },
        {
          name: 'street',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
        },
        {
          name: 'province',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'expectedDeliveryDate',
      type: 'date',
      required: true,
      timezone: true,
    },
    {
      name: 'expectedDeliveryDate_tz',
      type: 'text',
      required: true,
    },
    {
      name: 'paymentMethod',
      type: 'text',
      required: true,
    },
    {
      name: 'paymentResult',
      type: 'group',
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'status',
          type: 'text',
        },
        {
          name: 'email_address',
          type: 'text',
        },
        {
          name: 'pricePaid', // ADD THIS FIELD
          type: 'text',
        },
      ],
    },
    {
      name: 'itemsPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'shippingPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'taxPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'paidAt',
      type: 'date',
      timezone: true,
    },
    {
      name: 'isDelivered',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'deliveredAt',
      type: 'date',
      timezone: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      timezone: true,
      defaultValue: () => new Date(),
    },
  ],
  timestamps: true,
}
