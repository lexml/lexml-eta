export const padTo2Digits = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const formatDDMMYYYY = (date: Date): string => {
  return [padTo2Digits(date.getDate()), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
};
