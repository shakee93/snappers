import React from "react";
import { redirect } from 'next/navigation';

const QuickPage: React.FC = () => {
  // Check if we're in a development environment
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <main className="min-h-screen flex flex-col text-center justify-center items-center">
      <h1 className='text-5xl mb-10 font-bold'>TEST ENVIRONMENT</h1>
      {/* Your test content here */}
    </main>
  );
};

export default QuickPage;
