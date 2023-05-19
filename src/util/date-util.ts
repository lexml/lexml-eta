export const padTo2Digits = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const formatDDMMYYYY = (date: Date): string => {
  return [padTo2Digits(date.getDate()), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/');
};

export const formatDateTime = (date: Date): string => {
  const data = [date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join('-');
  const hora = [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes()), padTo2Digits(date.getSeconds())].join(':');
  return `${data} ${hora}`;
};
