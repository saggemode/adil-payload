'use server'

import { AVAILABLE_DELIVERY_DATES, PAGE_SIZE } from '@/constants'
import { getMeUser } from '@/utilities/getMeUser'

import { Cart, OrderItem, ShippingAddress } from '@/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import {  OrderInputSchema } from '@/types/validator'
import { paypal } from './paypal'
import { Order, SupportedTimezones } from '@/payload-types'
import { revalidatePath } from 'next/cache'
import { round2, formatError } from '@/utilities/generateId'



export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + item.price * item.quantity, 0))

  const deliveryDate =
    AVAILABLE_DELIVERY_DATES[
      deliveryDateIndex === undefined ? AVAILABLE_DELIVERY_DATES.length - 1 : deliveryDateIndex
    ]
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 && itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)

  const totalPrice = round2(
    itemsPrice + (shippingPrice ? round2(shippingPrice) : 0) + (taxPrice ? round2(taxPrice) : 0),
  )
  return {
    AVAILABLE_DELIVERY_DATES,
    deliveryDateIndex:
      deliveryDateIndex === undefined ? AVAILABLE_DELIVERY_DATES.length - 1 : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

export const createOrder = async (clientSideCart: Cart) => {
  try {
    // console.log('createOrder called with cart:', clientSideCart)
    const { user } = await getMeUser()

    if (!user) throw new Error('User not authenticated')

   
    // Recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(clientSideCart, user.id!.toString())

    // console.log('Order created successfully:', createdOrder)

    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder.id.toString() },
    }
  } catch (error) {
    console.error('Error in createOrder:', error)
    return { success: false, message: formatError(error) }
  }
}

export const createOrderFromCart = async (clientSideCart: Cart, userId: string) => {
  // Convert `product` from string to number
  const processedItems = clientSideCart.items.map((item) => {
    const productId = typeof item.product === 'string' ? Number(item.product) : item.product

    if (isNaN(productId)) {
      throw new Error(`Invalid product ID: ${item.product}`)
    }

    return {
      ...item,
      product: productId, // Use the converted number
    }
  })

  // Calculate prices and delivery details
  const cart = {
    ...clientSideCart,
    ...(await calcDeliveryDateAndPrice({
      items: processedItems, // Use the processed items here
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    })),
  }

  // Convert userId to a number
  const userIdNumber = parseInt(userId, 10)

  // Prepare order data
  const orderData = {
    user: userIdNumber,
    items: cart.items.map((item) => ({
      ...item,
      product: typeof item.product === 'string' ? Number(item.product) : item.product,
    })),
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate
      ? cart.expectedDeliveryDate.toISOString()
      : new Date().toISOString(),
    //expectedDeliveryDate_tz: Intl.DateTimeFormat().resolvedOptions().timeZone, // Add timezone
    expectedDeliveryDate_tz: 'Africa/Lagos' as SupportedTimezones,
  }

  // Validate input using your schema
  const validatedOrderData = OrderInputSchema.parse(orderData)

  console.log('Validated order data:', validatedOrderData)

  // Check for missing required fields
  const requiredFields = [
    'user',
    'items',
    'shippingAddress',
    'paymentMethod',
    'itemsPrice',
    'shippingPrice',
    'taxPrice',
    'totalPrice',
    'expectedDeliveryDate',
  ]
  // requiredFields.forEach((field) => {
  //   if (!validatedOrderData[field]) {
  //     console.error(`Missing required field: ${field}`)
  //   }
  // })
  requiredFields.forEach((field) => {
    if (!(validatedOrderData as Record<string, any>)[field]) {
      console.error(`Missing required field: ${field}`)
    }
  })

  try {
    //console.log('Creating order with data:', validatedOrderData)

    // Create order in Payload collection
    const payload = await getPayload({ config: configPromise })
    const order = await payload.create({
      collection: 'orders', // Ensure this matches the slug in your collection definition
      data: validatedOrderData,
    })

    //console.log('Order created in Payload:', order)
  
    return order
  } catch (error) {
    console.error('Error creating order in Payload:', error)
    throw new Error('Failed to create order in Payload CMS')
  }
}


export async function getOrderById(orderId: string): Promise<Order> {
  try {
    // Fetch the order using Payload's findByID method
     const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({
      collection: 'orders', // Name of the collection
      id: orderId, // Order ID
      depth: 1, // Optional: Populate relationships (e.g., user, items)
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  } catch (error) {
    throw new Error(`Failed to fetch order: ${error}`)
  }
}

export async function updateOrderToPaid(orderId: string) {
  try {
     const payload = await getPayload({ config: configPromise })
    const order = await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        isPaid: true,
        paidAt: new Date().toISOString(),
      },
    })

    // if (order.user) {
    //   await sendPurchaseReceipt({ order })
    // }

    return { success: true, message: 'Order paid successfully' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function deliverOrder(orderId: string) {
  try {
     const payload = await getPayload({ config: configPromise })
    const order = await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        isDelivered: true,
        deliveredAt: new Date().toISOString(),
      },
    })

    // if (order.user) {
    //   await sendAskReviewOrderItems({ order })
    // }

    return { success: true, message: 'Order delivered successfully' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function deleteOrder(id: string) {
  try {
     const payload = await getPayload({ config: configPromise })
    await payload.delete({
      collection: 'orders',
      id,
    })

    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// export async function getMyOrders({ limit, page }: { limit?: number; page: number }) {
//   const { user } = await getMeUser()
//    const payload = await getPayload({ config: configPromise })
//   if (!user) throw new Error('User not authenticated')
    

//   const orders = await payload.find({
//     collection: 'orders',
//     where: {  user.id },
//     limit,
//     page,
//   })

//   return {
//     data: orders.docs,
//     totalPages: orders.totalPages,
//   }
// }

export async function getMyOrders({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
   const payload = await getPayload({ config: configPromise })
const { user } = await getMeUser()

  if (!user) {
    throw new Error('User is not authenticated')
  }

  const skipAmount = (page - 1) * limit
   limit = limit || PAGE_SIZE

  const { docs: orders, totalDocs } = await payload.find({
    collection: 'orders',
    where: {
      user: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit,
    page,
  })

  return {
    data: orders,
    totalPages: Math.ceil(totalDocs / limit),
  }
}



export async function createPayPalOrder(orderId: string) {
  try {
     const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice)
      await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: '',
            status: '',
            //pricePaid: '0',
            pricePaid: order.totalPrice.toString(),
          },
        },
      })

      return {
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id,
      }
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function approvePayPalOrder(orderId: string, data: { orderID: string }) {
  try {
    // Find the order from the Payload "orders" collection.
    // Adjust the depth as needed if you want to include related user data.
 const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1, // increase depth if you need more nested relation data
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Capture the payment via your PayPal integration
    const captureData = await paypal.capturePayment(data.orderID)
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in paypal payment')
    }

    // Update the order fields
    const updatedData = {
      isPaid: true,
      paidAt: new Date().toISOString(), // Assuming the field is a date string
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    }

    // Update the order in Payload
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: orderId,
      data: updatedData,
    })

    // Optionally send a purchase receipt
    //await sendPurchaseReceipt({ order: updatedOrder })

    // Revalidate the static path if you are using incremental static regeneration (optional)
    revalidatePath(`/account/orders/${orderId}`)

    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
