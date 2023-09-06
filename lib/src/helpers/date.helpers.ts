import { Timestamp } from 'firebase-admin/firestore';

export function getDateFromSeconds(seconds: Object | number | Timestamp | Date) {
  const fn = (data: number) => {
    if (!isNaN(data) && typeof data === 'number' && data !== undefined) {
      const date = new Date(Date.UTC(1970, 0, 1)); // Epoch
      date.setSeconds(data);
      return date;
    }
    return data;
  };
  if (typeof seconds == 'number') {
    return fn(seconds);
  } else if (typeof seconds == 'object') {
    if (seconds instanceof Timestamp) {
      return fn(seconds.seconds);
    } else if (seconds instanceof Date) {
      return seconds;
    }
  }
  return seconds;
}
