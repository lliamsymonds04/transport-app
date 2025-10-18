export function formatTime(time: Date): string {
  const now = new Date();

  const isSameDay =
    time.getFullYear() === now.getFullYear() &&
    time.getMonth() === now.getMonth() &&
    time.getDate() === now.getDate();

  const timeFormatter = new Intl.DateTimeFormat('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isSameDay) {
    return timeFormatter.format(time);
  } else {
    const dayFormatter = new Intl.DateTimeFormat('en-AU', { weekday: 'short' });
    return `${dayFormatter.format(time)} ${timeFormatter.format(time)}`;
  }
}
