import { Season } from '../../../generated/prisma';
import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';
import { FaEdit, FaTrash, FaSun, FaCalendarAlt, FaSnowflake, FaStar, FaCalendarCheck, FaTag } from 'react-icons/fa';
import { DeleteButton, EditButton } from './DeleteButtons';



async function getRentalPeriods() {
  const periods = await prisma.season.findMany({
    orderBy: {
      startDate: 'asc',
    },
  });
  return periods;
}

const typeStyles: { [key: string]: { icon: React.ReactElement, badge: string } } = {
  'Winter': { icon: <FaSnowflake className="text-blue-500 mr-3" />, badge: 'bg-blue-200 text-blue-800' },
  'Summer': { icon: <FaSun className="text-yellow-500 mr-3" />, badge: 'bg-yellow-200 text-yellow-800' },
  'Summer High': { icon: <FaSun className="text-orange-500 mr-3" />, badge: 'bg-orange-200 text-orange-800' },
  'Special': { icon: <FaStar className="text-purple-500 mr-3" />, badge: 'bg-purple-200 text-purple-800' },
  'Mid-term': { icon: <FaCalendarCheck className="text-green-500 mr-3" />, badge: 'bg-green-200 text-green-800' },
  'default': { icon: <FaTag className="text-gray-500 mr-3" />, badge: 'bg-gray-200 text-gray-800' },
};

const TypeBadge = ({ type }: { type: string | null }) => {
  if (!type) type = 'default';
  const style = typeStyles[type] || typeStyles['default'];
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style.badge}`}>
      {type}
    </span>
  );
};

const VisibilityToggle = ({ visible }: { visible: boolean }) => {
  return (
    <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${visible ? 'bg-green-500' : 'bg-gray-300'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${visible ? 'translate-x-6' : ''}`}></div>
    </div>
  );
};


export default async function RentalPeriodsPage() {
  const periods = await getRentalPeriods();

  return (
    <div className="bg-gray-50 flex-grow p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rental Periods</h1>
          <p className="text-sm text-gray-500 mt-1">Manage different pricing seasons and rental periods</p>
        </div>
        <div className="flex space-x-2">
           <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors">
            <FaTrash className="inline-block mr-2" />
            Delete Selected
          </button>
          <Link href="/admin/setup/rental-periods/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
              + Add New Period
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          {/* Header can be more dynamic if needed */}
        </div>
        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-4 text-left w-10"><input type="checkbox" /></th>
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Start Date</th>
              <th className="p-4 text-left font-semibold">End Date</th>
              <th className="p-4 text-left font-semibold">Type</th>
              <th className="p-4 text-left font-semibold">Visible</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period: Season) => {
              const style = typeStyles[period.type || 'default'] || typeStyles['default'];
              return (
                <tr key={period.id} className="border-b hover:bg-gray-50">
                  <td className="p-4"><input type="checkbox" /></td>
                  <td className="p-4 flex items-center">
                    {style.icon}
                    {period.name}
                  </td>
                  <td className="p-4">{new Date(period.startDate).toLocaleDateString('en-GB')}</td>
                  <td className="p-4">{new Date(period.endDate).toLocaleDateString('en-GB')}</td>
                  <td className="p-4"><TypeBadge type={period.type} /></td>
                  <td className="p-4"><VisibilityToggle visible={true} /></td>
                  <td className="p-4 flex space-x-2">
                    <EditButton periodId={period.id} />
                    <DeleteButton periodId={period.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 