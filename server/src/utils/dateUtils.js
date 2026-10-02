export const diffDays = (end, start) => Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
export const addHours = (date, hours) => new Date(new Date(date).getTime() + hours * 3600000);
export const addDays = (date, days) => new Date(new Date(date).getTime() + days * 86400000);
