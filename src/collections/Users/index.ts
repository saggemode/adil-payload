import type { CollectionConfig } from 'payload'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { admins } from '@/access/admins'
import { resolveDuplicatePurchases } from './hooks/resolveDuplicatePurchases'
import { checkRole } from './checkRole'
//import { CustomerSelect } from './ui/CustomerSelect'
import adminsAndUser from './access/adminsAndUser'
import { anyone } from '@/access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: adminsAndUser,
    create: anyone,
    update: adminsAndUser,
    delete: admins,
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    description: 'Users of the platform',
    listSearchableFields: ['email', 'name'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },

    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['customer'],
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'customer',
          value: 'customer',
        },
        {
          label: 'moderator',
          value: 'moderator',
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      // access: {
      //   read: admins,
      //   create: admins,
      //   update: admins,
      // },
    },

    // {
    //   name: 'purchases',
    //   label: 'Purchases',
    //   type: 'relationship',
    //   relationTo: 'products',
    //   hasMany: true,
    //   hooks: {
    //     beforeChange: [resolveDuplicatePurchases],
    //   },
    // },
    {
      name: 'stripeCustomerID',
      label: 'Stripe Customer',
      type: 'text',
      access: {
        read: ({ req: { user } }) => {
          if (!user) {
            return false // Prevent access if user is null
          }
          return checkRole(['admin'], user) // Proceed if user exists
        },
      },
      admin: {
        position: 'sidebar',
        // components: {
        //   Field: CustomerSelect,
        // },
      },
    },

    {
      label: 'Cart',
      name: 'cart',
      type: 'group',
      fields: [
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          interfaceName: 'CartItems',
          fields: [
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
            },
            {
              name: 'quantity',
              type: 'number',
              min: 0,
              admin: {
                step: 1,
              },
            },
          ],
        },

        {
          name: 'itemsPrice',
          label: 'Items Price',
          type: 'number',
        },
        {
          name: 'taxPrice',
          label: 'Tax Price',
          type: 'number',
          required: false,
        },
        {
          name: 'shippingPrice',
          label: 'Shipping Price',
          type: 'number',
          required: false,
        },
        {
          name: 'totalPrice',
          label: 'Total Price',
          type: 'number',
        },
        {
          name: 'paymentMethod',
          label: 'Payment Method',
          type: 'text',
          required: false,
        },
        {
          name: 'shippingAddress',
          label: 'Shipping Address',
          type: 'text',

          required: false,
        },
        {
          name: 'deliveryDateIndex',
          label: 'Delivery Date Index',
          type: 'date',
          timezone: true,
          required: false,
        },
        {
          name: 'expectedDeliveryDate',
          label: 'Expected Delivery Date',
          type: 'date',
          required: false,
          timezone: true,
        },
      ],
    },

    {
      name: 'skipSync',
      label: 'Skip Sync',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        readOnly: true,
        hidden: true,
      },
    },
  ],
  timestamps: true,
}
