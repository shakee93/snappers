import React from 'react';
import { Clock } from 'lucide-react';

interface PreOrderNoticeProps {
  className?: string;
}

const PreOrderNotice: React.FC<PreOrderNoticeProps> = ({ className = "" }) => {
  return (
    <div className={`p-3 bg-gray-50 border-l-4 border-blue-500 rounded-r-md ${className}`}>
      <div className="flex items-center gap-2 text-gray-700 mb-1">
        <Clock className="w-4 h-4 text-blue-500" />
        <span className="text-sm">Delivery in 7-10 business days</span>
      </div>
      <p className="text-xs text-gray-500 ml-6">First come, first served - reserve yours now!</p>
    </div>
  );
};

export default PreOrderNotice;