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

export async function getVehicleLocations() {
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

      vehicles.push({
        id: entity.id,
        latitude: entity.vehicle?.position?.latitude,
        longitude: entity.vehicle?.position?.longitude,
        name: entity.vehicle?.vehicle?.label,
      });
    });

    //return vehicles;
    return feed.entity;

  } catch (error) {
    console.error("Error in getVehicleLocations:", error);
  }

}
