interface DisplayTransit {
  name: string;
  shortName: string;
  arrivalStop: string;
  leaveStop: string;
  stops: number;
}

export interface DisplayRouteLeg {
  transitType: "Walk" | "Transit";
  arrivalTime?: Date;
  leaveTime?: Date;
  transitDetails?: DisplayTransit;
  duration: number;

}

export interface TransitRoute {
  duration: number;
  legs: DisplayRouteLeg[];
  distance: string;
  leaveTime?: Date;
  arriveTime?: Date;

}
