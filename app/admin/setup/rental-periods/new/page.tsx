"use client";

import { useFormState } from 'react-dom';
import { createRentalPeriod, getAllSeasons } from '../actions';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Season = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: string | null;
};

export default function AddRentalPeriodPage() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createRentalPeriod, initialState);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'Winter'
  });

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const allSeasons = await getAllSeasons();
        setSeasons(allSeasons);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  const handleSeasonCopy = (seasonId: string) => {
    if (!seasonId) {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        type: 'Winter'
      });
      return;
    }

    const selectedSeason = seasons.find(s => s.id === seasonId);
    if (selectedSeason) {
      setFormData({
        name: '', // Keep name empty so user must provide new name
        startDate: new Date(selectedSeason.startDate).toISOString().split('T')[0],
        endDate: new Date(selectedSeason.endDate).toISOString().split('T')[0],
        type: selectedSeason.type || 'Winter'
      });
    }
  };

  return (
    <div className="bg-gray-50 flex-grow p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Rental Period</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new pricing season or holiday period.</p>
          </div>
        </div>

        <form action={dispatch} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          
          {/* Copy from existing season */}
          <div>
            <label htmlFor="copyFrom" className="block text-sm font-medium text-gray-700 mb-1">Copy from existing period (optional)</label>
            <select
              id="copyFrom"
              value={selectedSeasonId}
              onChange={(e) => {
                setSelectedSeasonId(e.target.value);
                handleSeasonCopy(e.target.value);
              }}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Create new period from scratch --</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">Select an existing period to copy its dates, type, and pricing rates. You must provide a new name.</p>
          </div>

          {/* Hidden field for copyFromId */}
          <input type="hidden" name="copyFromId" value={selectedSeasonId} />
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., High Season 2025"
              aria-describedby="name-error"
            />
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name && state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-600" key={error}>{error}</p>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-describedby="startDate-error"
              />
               <div id="startDate-error" aria-live="polite" aria-atomic="true">
                {state.errors?.startDate && state.errors.startDate.map((error: string) => (
                  <p className="mt-2 text-sm text-red-600" key={error}>{error}</p>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-describedby="endDate-error"
              />
              <div id="endDate-error" aria-live="polite" aria-atomic="true">
                {state.errors?.endDate && state.errors.endDate.map((error: string) => (
                  <p className="mt-2 text-sm text-red-600" key={error}>{error}</p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Winter">Winter</option>
              <option value="Summer">Summer</option>
              <option value="Summer High">Summer High</option>
              <option value="Special">Special</option>
              <option value="Mid-term">Mid-term</option>
            </select>
          </div>

          <div id="form-error" aria-live="polite" aria-atomic="true">
            {state.errors?.overlap && state.errors.overlap.map((error: string) => (
              <p className="mt-2 text-sm text-red-600" key={error}>{error}</p>
            ))}
             {state.message && (
                <p className="mt-2 text-sm text-red-600">{state.message}</p>
              )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link href="/admin/setup/rental-periods" className="text-gray-600 font-medium hover:text-gray-900">
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              {selectedSeasonId ? 'Copy Period' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 