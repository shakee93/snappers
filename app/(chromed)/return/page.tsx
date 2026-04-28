import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ReturnPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
        <p className="text-gray-600 mb-8">
          You will receive a confirmation email shortly with your order details.
        </p>
        <div className="space-y-4">
          <Link
            href="/my-orders"
            className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 