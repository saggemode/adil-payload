import type { Access, AccessArgs } from 'payload'
import type { User } from '../payload-types'
import { checkRole } from '@/collections/Users/checkRole'

export const adminsOrLoggedIn: Access = ({ req }: AccessArgs<User>) => {
  const user = req.user

  if (user && checkRole(['admin'], user)) {
    return true
  }

  return !!user
}
