import type { CollectionAfterChangeHook } from 'payload'


export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation === 'create' && doc.user) {
    // await sendPurchaseReceipt({ order: doc })
  }
}
