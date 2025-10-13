export async function getUserLocation(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

