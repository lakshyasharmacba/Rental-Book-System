import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [state, setState] = useState({ 
    lat: null, 
    lng: null, 
    city: null, 
    error: null, 
    loading: true 
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported by your browser', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude, 
          city: null, // Reverse geocoding would happen here in a real app
          error: null, 
          loading: false 
        });
      },
      (err) => {
        setState(s => ({ ...s, error: err.message, loading: false }));
      },
      { timeout: 10000 }
    );
  }, []);

  return state;
};
