import { getTranslations } from 'next-intl/server';
import { PrismaClient, Vehicle } from '../../generated/prisma';
import VehicleCard from '../../components/vehicle-guide/VehicleCard';
import VehicleSearch from '../../components/vehicle-guide/VehicleSearch';

const prisma = new PrismaClient();

async function getVehicleData(): Promise<Vehicle[]> {
  const allVehicles = await prisma.vehicle.findMany({
    where: { 
      visible: true, // Only show visible vehicles
      category: {
        visible: true // Only show vehicles from visible categories
      }
    },
    include: {
      category: true
    },
    orderBy: [
      {
        group: 'asc' // Order by vehicle group alphabetically
      },
      {
        name: 'asc' // Then by vehicle name
      }
    ]
  });
  return allVehicles;
}

export default async function VehicleGuidePage() {
  const t = await getTranslations('VehicleGuide');
  const vehicles = await getVehicleData();

  return (
    <div className="petsas-main vehicle-guide-bg">
      <VehicleSearch />
      <div className="vehicle-guide-container">
        <h1 className="vehicle-guide-title">{t('title')}</h1>
        <div className="vehicle-list">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.code} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </div>
  );
} 