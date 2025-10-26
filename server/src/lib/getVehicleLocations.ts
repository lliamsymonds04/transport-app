import GTFSRealtimeBindings from 'gtfs-realtime-bindings';

const busLocationsUrl = 'https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions';

import type { VehicleInfo } from '@shared/vehicleInfo';

let cache: { data: VehicleInfo[]; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

function getVehicleType(routeId: string | null): string | null {
	if (!routeId) return null;

	// Ferry routes (e.g., "F1", "F2", "FCTC")
	if (routeId.startsWith('F')) return 'Ferry';

	// Train routes with hyphens (e.g., "RWBR-4442", "GOLD-1234")
	if (routeId.match(/^[A-Z]{2,4}-\d+$/)) return 'Train';

	// Bus routes are numeric (e.g., "100", "111", "222")
	if (routeId.match(/^\d+$/)) return 'Bus';

	// Bus routes with trip identifiers (e.g., "412-1000", "553-4397")
	if (routeId.match(/^\d+-\d+$/)) return 'Bus';

	// Mixed alphanumeric might be special bus services (e.g., "P88", "N200")
	if (routeId.match(/^[A-Z]\d+$/)) return 'Bus';

	if (routeId.startsWith('M')) return 'Metro';

	return 'Unknown';
}

function getVehicleStopStatusString(status: number | null): string | null {
	if (status === null) return null;

	const statusMap: { [key: number]: string } = {
		0: 'Incoming at',
		1: 'Stopped at',
		2: 'In transit to'
	};

	return statusMap[status] || 'Unknown';
}

function getRouteName(routeId: string | null): string | null {
	if (!routeId) return null;

	if (routeId.includes('-')) {
		return routeId.split('-')[0] || null;
	}

	return routeId;
}

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

			vehicles.push({
				id: entity.id,
				latitude: entity.vehicle.position?.latitude ?? null,
				longitude: entity.vehicle.position?.longitude ?? null,
				name: entity.vehicle.vehicle?.label ?? null,
				vehicleType: getVehicleType(entity.vehicle.trip?.routeId ?? null),
				status: getVehicleStopStatusString(entity.vehicle.currentStatus ?? null),
				route: getRouteName(entity.vehicle.trip?.routeId ?? null)
			});
		});

		cache = {
			data: vehicles,
			timestamp: Date.now()
		};

		return vehicles;
	} catch (error) {
		console.error('Error in getVehicleLocations:', error);
		return null;
	}
}
