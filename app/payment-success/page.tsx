"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Info, Copy, Check } from "lucide-react";

interface RequestData {
  [key: string]: string | string[] | undefined;
}

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const [requestData, setRequestData] = useState<RequestData>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Extract all URL parameters
    const params: RequestData = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    setRequestData(params);
  }, [searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(requestData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const hasData = Object.keys(requestData).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Success
          </h1>
          <p className="text-gray-600">
            Payment callback received
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Info className="w-5 h-5" />
              Request Body / Query Parameters
            </h2>
            {hasData && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy JSON
                  </>
                )}
              </button>
            )}
          </div>

          {hasData ? (
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <pre className="text-sm text-gray-700 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                {JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                No request data received. This page expects query parameters or a POST request body.
              </p>
            </div>
          )}

          {/* Request Info */}
          {hasData && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Method:</span>
                  <span className="text-gray-900">GET (Query Parameters)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">URL:</span>
                  <span className="text-gray-900 break-all">{typeof window !== 'undefined' ? window.location.href : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Parameters Count:</span>
                  <span className="text-gray-900">{Object.keys(requestData).length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors block text-center font-medium"
            >
              Return to Home
            </Link>
            <Link
              href="/shop"
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors block text-center font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            About This Page
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This page displays all query parameters from the payment gateway callback</li>
            <li>• The request body is shown in JSON format for easy debugging</li>
            <li>• You can copy the JSON data using the copy button</li>
            <li>• For POST requests, use the API route at <code className="bg-blue-100 px-1 rounded">/api/payment-success</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
