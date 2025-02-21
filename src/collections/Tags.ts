import type { CollectionConfig } from 'payload'

import { admins } from '@/access/admins'

export const Tags: CollectionConfig = {
  slug: 'tags',
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
