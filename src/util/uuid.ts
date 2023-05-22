export const generateUUID = (): string => {
  let uuid = '';

  for (let i = 0; i < 32; i++) {
    const randomNumber = (Math.random() * 16) | 0;
    const value = (i === 12 ? 4 : i === 16 ? (randomNumber & 3) | 8 : randomNumber).toString(16);

    uuid += (i === 8 || i === 12 || i === 16 || i === 20 ? '-' : '') + value;
  }

  return uuid;
};
