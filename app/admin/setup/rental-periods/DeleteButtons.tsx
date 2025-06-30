'use client';

import { FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';

interface DeleteButtonProps {
  periodId: string;
}

interface EditButtonProps {
  periodId: string;
}

export function DeleteButton({ periodId }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this rental period?')) {
      try {
        // TODO: Implement delete functionality
        console.log('Deleting period:', periodId);
        // You can implement the delete server action here later
      } catch (error) {
        console.error('Error deleting period:', error);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors flex items-center"
    >
      <FaTrash className="mr-1" />
      Delete
    </button>
  );
}

export function EditButton({ periodId }: EditButtonProps) {
  return (
    <Link href={`/admin/setup/rental-periods/${periodId}`}>
      <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center">
        <FaEdit className="mr-1" />
        Edit
      </button>
    </Link>
  );
} 