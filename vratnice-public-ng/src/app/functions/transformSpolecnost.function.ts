export function transformSpolecnostFunction(obj: any): any{
// Pokud objekt není objekt nebo je null, vraťte jej nezměněný
if (typeof obj !== 'object' || obj === null) {
  return obj;
}

// Pokud je to instance Date, vraťte ji nezměněnou
if (obj instanceof Date) {
  return obj;
}

// Pokud je to pole, projděte každou položku rekurzivně
if (Array.isArray(obj)) {
  return obj.map(item => transformSpolecnostFunction(item));
}

// Jinak projděte každý klíč v objektu
const transformedObj: any = {};
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
      if ((key === 'spolecnost' || key === 'spolecnostZadatele' || key === 'spolecnostVozidla') && typeof obj[key] === 'string') {
          transformedObj[key] = { nazev: obj[key] };
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Rekurzivně zavolejte funkci na vnořený objekt, pokud to není instance Date
          transformedObj[key] = transformSpolecnostFunction(obj[key]);
      } else {
          // Jinak zkopírujte hodnotu beze změny
          transformedObj[key] = obj[key];
      }
  }
}

return transformedObj;
}
