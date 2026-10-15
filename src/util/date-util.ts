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

// 'AAAA-MM-DD HH:mm:ss' (horário local, como em formatDateTime) -> ISO 8601 com o fuso da máquina na data informada.
export const formatDateTimeToIso = (dataHora: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(dataHora);
  if (!m) {
    return dataHora;
  }
  const deslocamento = -new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTimezoneOffset();
  const sinal = deslocamento < 0 ? '-' : '+';
  const abs = Math.abs(deslocamento);
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${sinal}${padTo2Digits(Math.floor(abs / 60))}:${padTo2Digits(abs % 60)}`;
};

// ISO 8601 com fuso -> 'AAAA-MM-DD HH:mm:ss' no horário local; undefined se inválida.
export const parseIsoToDateTime = (iso: string): string | undefined => {
  const instante = Date.parse(iso);
  return Number.isNaN(instante) ? undefined : formatDateTime(new Date(instante));
};
