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

export default function EditRentalPeriodForm({ period, categories, pricings }: EditRentalPeriodFormProps) {
    const [activeTab, setActiveTab] = useState('general');
    
    const initialState: State = { message: null, errors: {} };
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
                {formState.errors?.name && <p className="mt-2 text-sm text-red-600">{formState.errors.name.join(', ')}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <input id="startDate" name="startDate" type="date" defaultValue={period.startDate.toISOString().split('T')[0]} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {formState.errors?.startDate && <p className="mt-2 text-sm text-red-600">{formState.errors.startDate.join(', ')}</p>}
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date *</label>
                    <input id="endDate" name="endDate" type="date" defaultValue={period.endDate.toISOString().split('T')[0]} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {formState.errors?.endDate && <p className="mt-2 text-sm text-red-600">{formState.errors.endDate.join(', ')}</p>}
                </div>
            </div>
            {formState.errors?.overlap && <p className="mt-2 text-sm text-red-600">{formState.errors.overlap.join(', ')}</p>}
            {formState.message && <p className="mt-2 text-sm text-red-600">{formState.message}</p>}
            <div className="flex justify-end space-x-4">
                <Link href="/admin/setup/rental-periods" className="px-6 py-2 rounded-lg shadow-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Link>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"><FaSave className="inline-block mr-2"/>Save General</button>
            </div>
        </form>
    );

    const pricingMap = new Map(pricings.map(p => [`${p.categoryId}-${p.group}`, p]));

    const RatesTab = (
        <form action={handlePricingSubmit} className="bg-white rounded-xl shadow-sm mt-4">
            <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Rental Period Rates</h2>
                {pricingMessage && <div className="p-3 rounded-md bg-green-100 text-green-800">{pricingMessage}</div>}
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"><FaSave className="inline-block mr-2"/>Save Rates</button>
            </div>
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
        </form>
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