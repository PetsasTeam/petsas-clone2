import React from 'react';
import { getLocations } from './actions';
import LocationsClient from './LocationsClient';

const LocationsPage = async () => {
  const locations = await getLocations();

  return <LocationsClient initialLocations={locations} />;
};

export default LocationsPage; 