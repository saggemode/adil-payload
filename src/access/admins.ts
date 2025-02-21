import { checkRole } from '@/collections/Users/checkRole'
import type { AccessArgs } from 'payload'
import type { User } from '../payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

export const admins: isAdmin = ({ req: { user } }) => {
  if (!user) {
    return false // Return false if the user is null or undefined
  }

  return checkRole(['admin'], user)
}
