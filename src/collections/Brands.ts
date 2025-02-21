import type { CollectionConfig } from 'payload'
import { admins } from '@/access/admins'

export const Brands: CollectionConfig = {
  slug: 'brands',
  access: {
   read: () => true,
     create: admins,
     update: admins,
     delete: admins,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}
