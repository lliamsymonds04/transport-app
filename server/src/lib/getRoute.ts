const RouteEndpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';

async function getRoute(start: [number, number], end: [number, number]) {
    const api_key = process.env.GOOGLE_MAPS_API_KEY;
    if (!api_key) {
        throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
    }

    const resp = await fetch(
        RouteEndpoint,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': api_key,
            },
            body: JSON.stringify({
                origin: {
                    location: {
                        latLng: {
                            latitude: start[0],
                            longitude: start[1],
                        },
                    },
                },
                destination: {
                    location: {
                        latLng: {
                            latitude: end[0],
                            longitude: end[1],
                        },
                    },
                },
                travelMode: 'Transit',
                routingPreference: 'Traffic_Aware',
                computeAlternativeRoutes: false,
                languageCode: "en-AU",
                units: "METRIC"
            }),
        }
    );

    if (!resp.ok) {
        throw new Error(`Failed to fetch route: ${resp.statusText}`);
    }

    const data = await resp.json();
    return data;
}

module.exports = { getRoute };