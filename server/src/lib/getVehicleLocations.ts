import GTFSRealtimeBindings from "gtfs-realtime-bindings";

const busLocationsUrl = "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions";

interface VehicleInfo {
  id: string;
  latitude: number | undefined;
  longitude: number | undefined;
  name: string | null | undefined;
  //occupancyPercentage: string | null | undefined;
  //transitType: number | null | undefined;
}

let cache: { data: VehicleInfo[]; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

export async function getVehicleLocations() {
  // Return cached data if still valid
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }


  try {
    const response = await fetch(busLocationsUrl);

    if (!response.ok) {
      throw new Error(`Error fetching vehicle locations: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    const vehicles: VehicleInfo[] = [];

    feed.entity.forEach((entity) => {
      if (!entity.vehicle) return;
      console.log(entity)

      vehicles.push({
        id: entity.id,
        latitude: entity.vehicle?.position?.latitude,
        longitude: entity.vehicle?.position?.longitude,
        name: entity.vehicle?.vehicle?.label,
      });
    });

    //return vehicles;
    //const result = feed.entity;
    
    // Update cache
    cache = {
      data: vehicles,
      timestamp: Date.now()
    };

    return vehicles;

  } catch (error) {
    console.error("Error in getVehicleLocations:", error);
  }

}
