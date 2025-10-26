
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
}

export interface LocalizedTransitTime {
  time: TransitTime;
  timeZone: string;
}

export interface TransitAgency {
  name: string;
  phoneNumber: string;
  uri: string;
}

export interface TransitDetails {
  stopDetails: {
    arrivalStop: TransitStop;
    arrivalTime: string;
    departureStop: TransitStop;
    departureTime: string;
  };
  localizedValues: {
    arrivalTime: LocalizedTransitTime;
    departureTime: LocalizedTransitTime;
  };
  headsign: string;
  transitLine: {
    agencies: TransitAgency[];
    name: string;
    uri: string;
    color: string;
    nameShort: string;
    textColor: string;
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
  staticDuration: string;
  polyline: Polyline;
  travelMode: "WALK" | "TRANSIT";
  transitDetails?: TransitDetails;
}

export interface RouteLeg {
  distanceMeters: number;
  duration: string;
  steps: RouteStep[];
}

export interface Route {
  legs: RouteLeg[];
}

export interface RoutesAPIResponse {
  routes: Route[];
}
