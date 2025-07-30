// Booking status constants
export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
} as const;

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
} as const;

// Payment type constants
export const PAYMENT_TYPE = {
  ONLINE: 'online',
  ON_ARRIVAL: 'arrival'
} as const;

// Type definitions for TypeScript
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PaymentType = typeof PAYMENT_TYPE[keyof typeof PAYMENT_TYPE];