import { useState, useEffect } from "react";

/**
 * @interface GeolocationState
 * @description Represents the state of the user's geolocation, including their coordinates, accuracy, and any potential errors.
 * @property {number | null} latitude - The user's latitude.
 * @property {number | null} longitude - The user's longitude.
 * @property {number | null} accuracy - The accuracy of the location in meters.
 * @property {string | null} error - Any error message related to geolocation.
 * @property {boolean} loading - Whether the geolocation is currently being fetched.
 */
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * A custom hook for tracking the user's geolocation.
 * It uses the `navigator.geolocation` API to watch for changes in the user's position
 * and provides the current location, accuracy, and any errors.
 * @returns {GeolocationState} The current geolocation state.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        loading: false,
      }));
      return;
    }

    /**
     * Handles a successful geolocation update.
     * @param {GeolocationPosition} position - The new position.
     */
    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    /**
     * Handles an error in getting the geolocation.
     * @param {GeolocationPositionError} error - The error object.
     */
    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unknown location error";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
