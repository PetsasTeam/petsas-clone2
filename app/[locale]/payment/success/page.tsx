import PaymentSuccessClient from './PaymentSuccessClient';

interface SearchParams {
  bookingId?: string;
  orderId?: string;
  [key: string]: string | string[] | undefined;
}

interface PaymentSuccessPageProps {
  searchParams: SearchParams;
}

export default function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  return (
    <PaymentSuccessClient 
      bookingId={searchParams.bookingId}
      orderId={searchParams.orderId}
    />
  );
} 