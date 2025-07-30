import { getTranslations } from 'next-intl/server';
import { Vehicle } from '../../generated/prisma';
import { prisma } from '../../../lib/prisma';
import VehicleCard from '../../components/vehicle-guide/VehicleCard';
import VehicleSearch from '../../components/vehicle-guide/VehicleSearch';



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

// Server-side location fetching for better performance
async function getLocations() {
  const locations = await prisma.location.findMany({
    where: { 
      visible: true 
    },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      name: true,
      type: true,
      visible: true,
      isPickupPoint: true,
      isDropoffPoint: true,
    }
  });
  
  return locations;
}

export default async function VehicleGuidePage() {
  const [t, vehicles, locations] = await Promise.all([
    getTranslations('VehicleGuide'),
    getVehicleData(),
    getLocations()
  ]);

  return (
    <div className="petsas-main vehicle-guide-bg">
      <VehicleSearch locations={locations} />
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