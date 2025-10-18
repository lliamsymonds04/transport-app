import type { Route, RouteStep } from "@shared/routeTypes";
import type { DisplayRouteLeg, TransitRoute } from "../types/transitRoute";

export function formatRouteResponse(response: Route): TransitRoute {
  const allSteps = response.legs.flatMap(leg => leg.steps);

  const legs: DisplayRouteLeg[] = allSteps.map((step: RouteStep) => {
    if (step.travelMode === "TRANSIT") {
      const { transitDetails } = step;
      return {
        transitType: "Transit",
        arrivalTime: new Date(transitDetails!.stopDetails.arrivalTime),
        leaveTime: new Date(transitDetails!.stopDetails.departureTime),
        transitDetails: {
          name: transitDetails!.transitLine.name,
          shortName: transitDetails!.transitLine.nameShort,
          arrivalStop: transitDetails!.stopDetails.arrivalStop.name,
          leaveStop: transitDetails!.stopDetails.departureStop.name,
          stops: transitDetails!.stopCount,
        }
      };
    } else { // WALK
      const durationInSeconds = parseInt(step.staticDuration.replace('s', ''));
      return {
        transitType: "Walk",
        arrivalTime: new Date(0),
        leaveTime: new Date(0),
        duration: durationInSeconds, // temporary
      } as any;
    }
  });

  for (let i = 0; i < legs.length; i++) {
    if (legs[i].transitType === "Walk") {
      const walkLeg = legs[i] as any;
      const prevLeg = i > 0 ? legs[i - 1] : null;
      const nextLeg = i < legs.length - 1 ? legs[i + 1] : null;

      if (prevLeg) {
        walkLeg.leaveTime = prevLeg.arrivalTime;
      }
      if (nextLeg) {
        walkLeg.arrivalTime = nextLeg.leaveTime;
      }

      if (walkLeg.leaveTime.getTime() && !walkLeg.arrivalTime.getTime()) {
        walkLeg.arrivalTime = new Date(walkLeg.leaveTime.getTime() + walkLeg.duration * 1000);
      }

      if (!walkLeg.leaveTime.getTime() && walkLeg.arrivalTime.getTime()) {
        walkLeg.leaveTime = new Date(walkLeg.arrivalTime.getTime() - walkLeg.duration * 1000);
      }
    }
  }

  const mergedLegs: DisplayRouteLeg[] = [];
  for (let i = 0; i < legs.length; i++) {
    const currentLeg = legs[i];
    if (currentLeg.transitType === "Walk") {
      let combinedDuration = (currentLeg as any).duration;
      let lastWalkIndex = i;
      while (lastWalkIndex + 1 < legs.length && legs[lastWalkIndex + 1].transitType === "Walk") {
        lastWalkIndex++;
        combinedDuration += (legs[lastWalkIndex] as any).duration;
      }

      const mergedWalkLeg: DisplayRouteLeg = {
        transitType: "Walk",
        leaveTime: currentLeg.leaveTime,
        arrivalTime: legs[lastWalkIndex].arrivalTime,
      };
      mergedLegs.push(mergedWalkLeg);
      i = lastWalkIndex;
    } else {
      mergedLegs.push(currentLeg);
    }
  }

  mergedLegs.forEach(leg => delete (leg as any).duration);

  const totalDuration = response.legs.reduce((total, leg) => total + parseInt(leg.duration.slice(0, -1)), 0);

  return {
    duration: totalDuration,
    legs: mergedLegs,
    leaveTime: mergedLegs[0].leaveTime,
    arriveTime: mergedLegs[mergedLegs.length - 1].arrivalTime,
  };
}
