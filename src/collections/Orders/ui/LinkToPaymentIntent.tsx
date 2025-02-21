import * as React from 'react'

import { TextField } from 'payload'
import { CopyToClipboard, useFormFields } from '@payloadcms/ui'
import { Text } from 'lucide-react'

export const LinkToPaymentIntent: React.FC<TextField> = props => {
  const { name, label } = props

  const { value: stripePaymentIntentID } = useFormFields(([fields]) => fields[name]) || {}

  const href = `https://dashboard.stripe.com/${
    process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY ? 'test/' : ''
  }payments/${stripePaymentIntentID}`

  return (
    <div>
      <p style={{ marginBottom: '0' }}>
        {typeof label === 'string' ? label : 'Stripe Payment Intent ID'}
      </p>
      <Text {...props} />
      {Boolean(stripePaymentIntentID) && (
        <div>
          <div>
            <span
              className="label"
              style={{
                color: '#9A9A9A',
              }}
            >
              {`Manage in Stripe`}
            </span>
            <CopyToClipboard value={href} />
          </div>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: '600',
            }}
          >
            <a
              href={`https://dashboard.stripe.com/${
                process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY ? 'test/' : ''
              }customers/${stripePaymentIntentID}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {href}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
