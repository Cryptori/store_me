// Midtrans server-side utilities
// Semua logic Midtrans dikumpulkan di sini agar mudah di-maintain

export const MIDTRANS_BASE_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://api.midtrans.com'
  : 'https://api.sandbox.midtrans.com'

export const MIDTRANS_SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1'

// Generate Authorization header dari server key
export function getMidtransAuthHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY not set')
  return 'Basic ' + Buffer.from(serverKey + ':').toString('base64')
}

// Verifikasi signature dari webhook Midtrans
// SHA512(order_id + status_code + gross_amount + server_key)
export async function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): Promise<boolean> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return false

  const raw = orderId + statusCode + grossAmount + serverKey
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return computed === receivedSignature
}

// Create Snap transaction
export async function createSnapTransaction(params: {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  description: string
}): Promise<{ token: string; redirect_url: string }> {
  const res = await fetch(`${MIDTRANS_SNAP_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getMidtransAuthHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: [{
        id: 'PRO_SUBSCRIPTION',
        price: params.amount,
        quantity: 1,
        name: params.description,
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error_messages?.[0] ?? 'Midtrans error')
  }

  return res.json()
}

// Check transaction status dari Midtrans API
export async function checkTransactionStatus(orderId: string): Promise<{
  transaction_status: string
  fraud_status: string
  status_code: string
  gross_amount: string
  signature_key?: string
}> {
  const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/status`, {
    headers: { 'Authorization': getMidtransAuthHeader() },
  })

  if (!res.ok) throw new Error('Failed to check transaction status')
  return res.json()
}