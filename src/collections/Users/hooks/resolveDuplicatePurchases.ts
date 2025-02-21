import { User } from '@/payload-types'
import type { FieldHook } from 'payload'

export const resolveDuplicatePurchases: FieldHook<User> = async ({ value, operation }) => {
  if ((operation === 'create' || operation === 'update') && value) {
    return Array.from(
      new Set(
        value?.map((purchase:any) => (typeof purchase === 'string' ? purchase : purchase.id)) || [],
      ),
    )
  }

  return
}
