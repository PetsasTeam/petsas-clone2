"use client";

import React, { useState } from 'react';
import { useFormState } from 'react-dom';
import { updateRentalPeriod, updatePricing, State } from '../actions';
import { Season, VehicleCategory, SeasonalPricing } from '../../../../../app/generated/prisma';
import { FaSave, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import Link from 'next/link';

interface EditRentalPeriodFormProps {
    period: Season;
    categories: (VehicleCategory & { vehicles: any[] })[];
    pricings: SeasonalPricing[];
}

// Helper type guards for error fields
function hasField<T extends string>(obj: any, field: T): obj is { [K in T]: string[] } {
  return obj && Array.isArray(obj[field]);
}

export default function EditRentalPeriodForm({ period, categories, pricings }: EditRentalPeriodFormProps) {
    const [activeTab, setActiveTab] = useState('general');
    
    const initialState: State = { message: '', errors: {} };
    const updatePeriodWithId = updateRentalPeriod.bind(null, period.id);
    const [formState, formDispatch] = useFormState(updatePeriodWithId, initialState);
    
    const [pricingMessage, setPricingMessage] = useState<string | null>(null);

    const handlePricingSubmit = async (formData: FormData) => {
        const result = await updatePricing(formData);
        if (result && result.message) {
            setPricingMessage(result.message);
            setTimeout(() => setPricingMessage(null), 3000);
        }
    };
    
    const [percent, setPercent] = useState(0);
    const [isApplying, setIsApplying] = useState(false);
    const [applyMessage, setApplyMessage] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // Refetch rates after update or reset
    const refetchRates = async () => {
        try {
            const res = await fetch(`/api/admin/seasonal-pricing?seasonId=${period.id}`);
            if (res.ok) {
                const data = await res.json();
                // Update the rates in state (if you use state for pricings)
                // For now, just reload the page as fallback
                window.location.reload();
            }
        } catch (err) {
            setApplyMessage('Failed to refresh rates.');
        }
    };

    // Price adjustment handler
    const handleApplyPercent = async () => {
        if (!window.confirm(`Are you sure you want to adjust all rates by ${percent}%? This cannot be undone.`)) return;
        setIsApplying(true);
        setApplyMessage(null);
        try {
            const res = await fetch('/api/admin/seasonal-pricing/update-by-percent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seasonId: period.id, percent }),
            });
            const data = await res.json();
            if (res.ok) {
                setApplyMessage(`Updated ${data.updated} rates. All prices rounded to 2 decimals.`);
                await refetchRates();
            } else {
                setApplyMessage(data.error || 'Failed to update prices.');
            }
        } catch (err) {
            setApplyMessage('Failed to update prices.');
        } finally {
            setIsApplying(false);
        }
    };

    // Reset to base rates handler
    const handleResetToBase = async () => {
        if (!window.confirm('Are you sure you want to reset all rates to their base values? This cannot be undone.')) return;
        setIsResetting(true);
        setApplyMessage(null);
        try {
            const res = await fetch('/api/admin/seasonal-pricing/reset-to-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seasonId: period.id }),
            });
            const data = await res.json();
            if (res.ok) {
                setApplyMessage(`Reset ${data.updated} rates to base values.`);
                await refetchRates();
            } else {
                setApplyMessage(data.error || 'Failed to reset rates.');
            }
        } catch (err) {
            setApplyMessage('Failed to reset rates.');
        } finally {
            setIsResetting(false);
        }
    };

    const GeneralTab = (
        <form action={formDispatch} className="bg-white p-8 rounded-lg shadow-md mt-4 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID</label>
                    <input id="id" defaultValue={period.id} disabled className="w-full mt-1 px-3 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <select id="type" name="type" defaultValue={period.type || ""} className="w-full mt-1 block px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="Winter">Winter</option>
                        <option value="Summer">Summer</option>
                        <option value="Summer High">Summer High</option>
                        <option value="Special">Special</option>
                        <option value="Mid-term">Mid-term</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                <input id="name" name="name" defaultValue={period.name} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                {formState.errors && hasField(formState.errors, 'name') && (
                  <p className="mt-2 text-sm text-red-600">{formState.errors.name.join(', ')}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <input id="startDate" name="startDate" type="date" defaultValue={period.startDate.toISOString().split('T')[0]} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {formState.errors && hasField(formState.errors, 'startDate') && (
                      <p className="mt-2 text-sm text-red-600">{formState.errors.startDate.join(', ')}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date *</label>
                    <input id="endDate" name="endDate" type="date" defaultValue={period.endDate.toISOString().split('T')[0]} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {formState.errors && hasField(formState.errors, 'endDate') && (
                      <p className="mt-2 text-sm text-red-600">{formState.errors.endDate.join(', ')}</p>
                    )}
                </div>
            </div>
            {formState.errors && hasField(formState.errors, 'overlap') && (
              <p className="mt-2 text-sm text-red-600">{formState.errors.overlap.join(', ')}</p>
            )}
            {formState.message && <p className="mt-2 text-sm text-red-600">{formState.message}</p>}
            <div className="flex justify-end space-x-4">
                <Link href="/admin/setup/rental-periods" className="px-6 py-2 rounded-lg shadow-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Link>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"><FaSave className="inline-block mr-2"/>Save General</button>
            </div>
        </form>
    );

    const pricingMap = new Map(pricings.map(p => [`${p.categoryId}-${p.group}`, p]));

    const RatesTab = (
        <div>
        {/* Price Adjustment Tool */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:space-x-6">
            <label className="font-medium text-blue-900 mr-4">Adjust all rates by %:</label>
            <input
                type="range"
                min={-50}
                max={100}
                value={percent}
                onChange={e => setPercent(Number(e.target.value))}
                className="w-48 mr-4"
                style={{ accentColor: percent === 0 ? '#2563eb' : percent > 0 ? '#16a34a' : '#dc2626' }}
            />
            <input
                type="number"
                min={-50}
                max={100}
                value={percent}
                onChange={e => setPercent(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center mr-4"
                step="1"
            />
            <span className="text-gray-700">{percent > 0 ? `+${percent}%` : percent === 0 ? 'Base rates' : `${percent}%`}</span>
            <button
                type="button"
                className="ml-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                onClick={handleApplyPercent}
                disabled={isApplying || percent === 0}
            >
                {isApplying ? 'Applying...' : 'Apply'}
            </button>
            <button
                type="button"
                className="ml-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 disabled:opacity-50"
                onClick={handleResetToBase}
                disabled={isResetting}
            >
                {isResetting ? 'Resetting...' : 'Reset to Base Rates'}
            </button>
        </div>
        {applyMessage && <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-800">{applyMessage}</div>}
        {/* Existing rates table */}
            <div className="p-6 border-t border-gray-200">
                <div className="space-y-8">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <h3 className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 rounded-t-lg border-t border-x border-gray-200">{category.name}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-200">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">GROUP</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-600">3-6 Days</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-600">7-14 Days</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-600">15+ Days</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {category.vehicles
                                            .sort((a, b) => a.group.localeCompare(b.group))
                                            .map((vehicle) => {
                                            const pricing = pricingMap.get(`${category.id}-${vehicle.group}`);
                                            if (!pricing) return null;
                                            return (
                                                <tr key={vehicle.id} className="even:bg-white odd:bg-gray-50">
                                                    <td className="p-2 font-medium text-gray-700">{vehicle.group}</td>
                                                    <td className="p-2"><input type="number" step="0.01" name={`price-${pricing.id}-3to6`} defaultValue={pricing.price3to6Days} className="w-24 text-center mx-auto block px-2 py-1 border border-gray-300 rounded-md"/></td>
                                                    <td className="p-2"><input type="number" step="0.01" name={`price-${pricing.id}-7to14`} defaultValue={pricing.price7to14Days} className="w-24 text-center mx-auto block px-2 py-1 border border-gray-300 rounded-md"/></td>
                                                    <td className="p-2"><input type="number" step="0.01" name={`price-${pricing.id}-15plus`} defaultValue={pricing.price15PlusDays} className="w-24 text-center mx-auto block px-2 py-1 border border-gray-300 rounded-md"/></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 flex-grow p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Edit Rental Period</h1>
                    <p className="text-sm text-gray-500 mt-1">{period.name}</p>
                </div>
            </div>
            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
                            <FaCalendarAlt className="mr-2 h-4 w-4"/> General
                        </button>
                        <button onClick={() => setActiveTab('rates')} className={`${activeTab === 'rates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
                            <FaMoneyBillWave className="mr-2 h-4 w-4"/> Rental Period Rates
                        </button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'general' && GeneralTab}
                    {activeTab === 'rates' && RatesTab}
                </div>
            </div>
        </div>
    );
}