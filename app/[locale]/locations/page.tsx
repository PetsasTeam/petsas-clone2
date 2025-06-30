import React from 'react';
import { getSiteContent } from '@/lib/siteContent';
import LocationsPageClient from './LocationsPageClient';

async function getLocationsMap() {
  const mapImage = await getSiteContent('locations_map');
  return mapImage || '/offices_map.jpg'; // Fallback to default
}

export default async function LocationsPage() {
  const mapImageUrl = await getLocationsMap();
  
  return <LocationsPageClient mapImageUrl={mapImageUrl} />;
} 