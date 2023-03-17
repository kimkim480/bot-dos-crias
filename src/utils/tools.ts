export function splitString(str: string) {
  // return str.match(/.{1,2000}/g) as string[];
  return str.match(/(.|[\r\n]){1,2000}/g) as string[];
}
