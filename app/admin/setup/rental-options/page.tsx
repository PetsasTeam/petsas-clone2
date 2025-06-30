import React from 'react';
import { getRentalOptions } from './actions';
import RentalOptionsClient from './RentalOptionsClient';

export default async function RentalOptionsPage() {
  const result = await getRentalOptions();
  
  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Rental Options</h3>
          <p className="text-red-600 text-sm mt-1">{result.error}</p>
        </div>
      </div>
    );
  }

  return <RentalOptionsClient rentalOptions={result.data} />;
} 