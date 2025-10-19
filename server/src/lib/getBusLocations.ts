import GTFSRealtimeBindings from "gtfs-realtime-bindings";

const busLocationsUrl = "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions";

interface BusInfo {
  latitude: number | undefined;
  longitude: number | undefined;
  name: string | null | undefined;
}

export async function getBusLocations() {
  try {
    const response = await fetch(busLocationsUrl);

    if (!response.ok) {
      throw new Error(`Error fetching bus locations: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    const vehicles: BusInfo[] = [];

    feed.entity.forEach((entity) => {
      vehicles.push({
        latitude: entity.vehicle?.position?.latitude,
        longitude: entity.vehicle?.position?.longitude,
        name: entity.vehicle?.vehicle?.label,
      });
    });

    return vehicles;

  } catch (error) {
    console.error("Error in getBusLocations:", error);
  }

}
