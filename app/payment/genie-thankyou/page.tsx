"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

interface GenieCallbackData {
  order_id?: string;
  payment_id?: string;
  status?: string;
  amount?: string;
  currency?: string;
  signature?: string;
  timestamp?: string;
  [key: string]: any;
}

const GenieThankYouContent = () => {
  const searchParams = useSearchParams();
  const [callbackData, setCallbackData] = useState<GenieCallbackData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'unknown'>('unknown');

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    // console.log(logEntry);
  };

  useEffect(() => {
    addLog("=== GENIE PAYMENT CALLBACK PAGE LOADED ===");
    addLog("Page URL: " + window.location.href);
    addLog("User Agent: " + navigator.userAgent);
    addLog("Referrer: " + document.referrer);

    // Extract all URL parameters
    const allParams: GenieCallbackData = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
      addLog(`URL Parameter - ${key}: ${value}`);
    });

    setCallbackData(allParams);
    addLog("All callback data extracted: " + JSON.stringify(allParams, null, 2));

    // Check for stored order data
    try {
      const storedOrder = localStorage.getItem("genie_last_order");
      if (storedOrder) {
        addLog("Found stored order data in localStorage");
        addLog("Stored order: " + storedOrder);
      } else {
        addLog("No stored order data found in localStorage");
      }
    } catch (error) {
      addLog("Error accessing localStorage: " + error);
    }

    // Determine payment status based on callback data
    const status = allParams.status?.toLowerCase();
    if (status === 'success' || status === 'completed') {
      setPaymentStatus('success');
      addLog("Payment status determined: SUCCESS");
    } else if (status === 'failed' || status === 'error') {
      setPaymentStatus('failed');
      addLog("Payment status determined: FAILED");
    } else if (status === 'pending') {
      setPaymentStatus('pending');
      addLog("Payment status determined: PENDING");
    } else {
      setPaymentStatus('unknown');
      addLog("Payment status determined: UNKNOWN");
    }

    // Simulate API call to verify payment
    addLog("Simulating payment verification...");
    setTimeout(() => {
      addLog("Payment verification completed");
      setIsLoading(false);
    }, 2000);

  }, [searchParams]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return "Payment Successful!";
      case 'failed':
        return "Payment Failed";
      case 'pending':
        return "Payment Processing";
      default:
        return "Payment Status Unknown";
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
        return "Your payment has been processed successfully. You will receive a confirmation email shortly.";
      case 'failed':
        return "Your payment could not be processed. Please try again or contact support.";
      case 'pending':
        return "Your payment is being processed. Please wait for confirmation.";
      default:
        return "Unable to determine payment status. Please contact support.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Genie Payment Callback
          </h1>
          <p className="text-gray-600">
            Testing page for Genie payment callback handling
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              {getStatusIcon()}
              <h2 className="text-2xl font-semibold mt-4 mb-2">
                {getStatusMessage()}
              </h2>
              <p className="text-gray-600">
                {getStatusDescription()}
              </p>
            </div>

            {/* Callback Data Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Callback Data
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="text-sm text-gray-700 overflow-auto max-h-64">
                  {JSON.stringify(callbackData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block text-center"
              >
                Return to Home
              </Link>
              <Link
                href="/shop"
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Debug Logs
              </h3>
              <button
                onClick={() => setLogs([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="bg-black text-green-400 rounded-md p-4 h-96 overflow-auto">
              <div className="text-xs font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {isLoading && (
                  <div className="text-yellow-400">
                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                    Processing...
                  </div>
                )}
              </div>
            </div>

            {/* Test Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => addLog("Manual test log entry")}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm"
              >
                Add Test Log
              </button>
              <button
                onClick={() => {
                  addLog("Simulating payment verification API call...");
                  setTimeout(() => {
                    addLog("API Response: { status: 'success', message: 'Payment verified' }");
                  }, 1000);
                }}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                Simulate API Call
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Testing Information
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This page captures all URL parameters from the Genie payment callback</li>
            <li>• All callback data is logged for debugging purposes</li>
            <li>• Payment status is determined based on the &apos;status&apos; parameter</li>
            <li>• Stored order data from localStorage is also logged</li>
            <li>• Use the debug panel to monitor all callback activities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const GenieThankYouPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment callback...</p>
        </div>
      </div>
    }>
      <GenieThankYouContent />
    </Suspense>
  );
};

export default GenieThankYouPage; 