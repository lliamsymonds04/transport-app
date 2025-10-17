interface DisplayTransit {
  name: string;
  shortName: string;
  arrivalStop: string;
  leaveStop: string;
  stops: number;
}

export interface DisplayRouteLeg {
  transitType: "Walk" | "Transit";
  arrivalTime: Date;
  leaveTime: Date;
  transitDetails?: DisplayTransit;

}

export interface TransitRoute {
  duration: number;
  legs: DisplayRouteLeg[];
  leaveTime: Date;
  arriveTime: Date;

}
