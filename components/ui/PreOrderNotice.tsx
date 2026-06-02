import React from 'react';
import { Clock } from 'lucide-react';

interface PreOrderNoticeProps {
  className?: string;
}

const PreOrderNotice: React.FC<PreOrderNoticeProps> = ({ className = "" }) => {
  return (
    <div 
      className={`p-3 bg-yellow-50 rounded-r-md ${className}`}
      style={{ borderLeft: '4px solid #f59e0b' }}
    >
      <div className="flex items-center gap-2 text-yellow-800 mb-1">
        <Clock className="w-4 h-4 text-yellow-600" />
        <span className="text-sm">Estimated delivery: 7–14 business days.</span>
      </div>
      <p className="text-xs text-yellow-700 ml-6">Orders are subject to stock availability and price changes. We will notify you promptly of any delays or cancellations.</p>
    </div>
  );
};

export default PreOrderNotice;