import type { CollectionAfterChangeHook } from 'payload'

export const loginAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  req: { payload, body = {} },
  operation,
}) => {
  try {
    // Ensure the operation is 'create' and there is no currently logged-in user
    if (operation === 'create' && !req.user) {
      // Explicitly type the body
      const { email, password } = body as { email?: string; password?: string }

      // Check if email and password are provided
      if (email && password) {
        const { user, token } = await payload.login({
          collection: 'users',
          data: { email, password },
          req,
        })

        // Return the updated document with the login token and user data
        return {
          ...doc,
          token,
          user,
        }
      } else {
        console.warn('Email or password missing in request body for auto-login.')
      }
    }
  } catch (error) {
    console.error('Error in loginAfterCreate hook:', error)
  }

  // Return the original document if auto-login doesn't occur
  return doc
}
