export function mergeObject(
  object1: { [key: string | number]: unknown },
  object2: { [key: string | number]: unknown }
): object {
  const newObject: { [key: string | number]: unknown } = {};
  for (const key of Object.keys(object1)) {
    newObject[key] = object1[key];
  }
  for (const key of Object.keys(object2)) {
    newObject[key] = object2[key];
  }
  return newObject;
}

export function formatDate(date: Date): string {
  // Format to yyyy-mm-dd
  return date.toISOString().substring(0, 10);
}
