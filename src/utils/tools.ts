export function splitString(str: string) {
  return str.match(/(.|[\r\n]){1,2000}/g) as string[];
}

export function logger(message?: string | Record<string, any>) {
  const date = new Date();

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'numeric',
    second: 'numeric',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  });

  return console.log(`[${formatter.format(date)}] `, message);
}
