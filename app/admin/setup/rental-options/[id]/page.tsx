import React from 'react';
import { getRentalOption } from '../actions';
import RentalOptionDetailClient from './RentalOptionDetailClient';

interface PageProps {
  params: { id: string };
}

export default async function RentalOptionDetailPage({ params }: PageProps) {
  const result = await getRentalOption(params.id);
  
  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Rental Option</h3>
          <p className="text-red-600 text-sm mt-1">{result.error}</p>
        </div>
      </div>
    );
  }

  return <RentalOptionDetailClient rentalOption={result.data} />;
} 