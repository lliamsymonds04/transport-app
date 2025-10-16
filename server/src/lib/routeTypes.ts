
export interface Polyline {
  encodedPolyline: string;
}

export interface TransitStop {
  name: string;
  location: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface TransitTime {
    text: string;
    timeZone: string;
}

export interface LocalizedTransitTime {
    time: TransitTime;
}

export interface TransitDetails {
  stopDetails: {
    arrivalStop: TransitStop;
    departureStop: TransitStop;
    arrivalTime: string;
    departureTime: string;
  };
  localizedValues: {
      arrivalTime: LocalizedTransitTime;
      departureTime: LocalizedTransitTime;
  };
  headsign: string;
  transitLine: {
    name: string;
    nameShort: string;
    color: string;
    vehicle: {
      name: {
        text: string;
      };
      type: string;
      iconUri: string;
    };
  };
  stopCount: number;
}

export interface RouteStep {
  polyline: Polyline;
  travelMode: 'WALK' | 'TRANSIT';
  transitDetails?: TransitDetails;
}

export interface RouteLeg {
  steps: RouteStep[];
}

export interface Route {
  legs: RouteLeg[];
  polyline: Polyline;
}

export interface RoutesAPIResponse {
  routes: Route[];
}
