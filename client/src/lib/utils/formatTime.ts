export function formatTime(time: Date): string {
	const now = new Date();

	const isSameDay =
		time.getFullYear() === now.getFullYear() &&
		time.getMonth() === now.getMonth() &&
		time.getDate() === now.getDate();

	const timeFormatter = new Intl.DateTimeFormat('en-AU', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	if (isSameDay) {
		return timeFormatter.format(time);
	} else {
		const dayFormatter = new Intl.DateTimeFormat('en-AU', { weekday: 'short' });
		return `${dayFormatter.format(time)} ${timeFormatter.format(time)}`;
	}
}

export function getISOTimeFromHHMM(time: string): string {
	// time is like "14:25"
	const [hours, minutes] = time.split(':').map(Number);
	const now = new Date(); // today
	now.setHours(hours, minutes, 0, 0); // set hours and minutes
	return now.toISOString(); // ready for API
}
