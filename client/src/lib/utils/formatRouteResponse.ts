import type { Route, RouteStep } from '@shared/routeTypes';
import type { DisplayRouteLeg, TransitRoute } from '../types/transitRoute';

export function formatRouteResponse(response: Route): TransitRoute {
	const allSteps = response.legs.flatMap((leg) => leg.steps);

	const legs: DisplayRouteLeg[] = allSteps.map((step: RouteStep) => {
		const durationInSeconds = parseInt(step.staticDuration.replace('s', ''));
		if (step.travelMode === 'TRANSIT') {
			const { transitDetails } = step;
			console.log('transitDetails:', transitDetails);
			return {
				transitType: 'Transit',
				arrivalTime: new Date(transitDetails!.stopDetails.arrivalTime),
				leaveTime: new Date(transitDetails!.stopDetails.departureTime),
				transitDetails: {
					name: transitDetails!.transitLine.name,
					shortName: transitDetails!.transitLine.nameShort,
					arrivalStop: transitDetails!.stopDetails.arrivalStop.name,
					leaveStop: transitDetails!.stopDetails.departureStop.name,
					stops: transitDetails!.stopCount
				},
				duration: durationInSeconds
			};
		} else {
			return {
				transitType: 'Walk',
				duration: durationInSeconds
			};
		}
	});
	console.log('lefts:', legs);

	const mergedLegs: DisplayRouteLeg[] = [];
	let i = 0;
	while (i < legs.length) {
		if (legs[i].transitType === 'Walk') {
			let combinedDuration = legs[i].duration;
			let j = i + 1;
			while (j < legs.length && legs[j].transitType === 'Walk') {
				combinedDuration += legs[j].duration;
				j++;
			}

			let arrivalTime: Date | undefined = undefined;
			let leaveTime: Date | undefined = undefined;

			let nextLeg: DisplayRouteLeg | null = null;
			if (j < legs.length) {
				nextLeg = legs[j];
			}

			let prevLeg: DisplayRouteLeg | null = null;
			if (i > 0) {
				prevLeg = mergedLegs[mergedLegs.length - 1];
			}

			// handle the leave and arrival times
			if (nextLeg) {
				arrivalTime = nextLeg.leaveTime;
			} else if (prevLeg) {
				arrivalTime = new Date((prevLeg.arrivalTime as Date).getTime() + combinedDuration * 1000);
			}

			if (prevLeg) {
				leaveTime = prevLeg.arrivalTime;
			} else if (nextLeg) {
				leaveTime = new Date((nextLeg.leaveTime as Date).getTime() - combinedDuration * 1000);
			}

			mergedLegs.push({
				transitType: 'Walk',
				leaveTime: leaveTime,
				arrivalTime,
				duration: combinedDuration
			});

			i = j; // skip merged legs
		} else {
			mergedLegs.push(legs[i]);
			i++;
		}
	}

	const totalDuration = response.legs.reduce(
		(total, leg) => total + parseInt(leg.duration.slice(0, -1)),
		0
	);

	return {
		duration: totalDuration,
		legs: mergedLegs,
		leaveTime: mergedLegs[0].leaveTime,
		arriveTime: mergedLegs[mergedLegs.length - 1].arrivalTime,
		distance: (response.legs[0].distanceMeters / 1000).toFixed(2)
	};
}
