export function errorTxtFunction(error: any): string {
  if (typeof error === "string")
    return error;
  //console.log("error", error);
  //var entries = Object.entries(error);
  //console.log("entries", entries);
  //var keys = Object.keys(error);
  var values = Object.values(error);
  //console.log("keys", keys);
  //console.log("values", values);
  //Odchycení chyby "true" a vypsání Server není dostupný. Opakujte akci později.
  if (values && values.length == 1 && values[0] == true) {
    return "Server není dostupný. Opakujte akci později.";
  }
  var errorTxt = "";
  values.forEach(value => {
    errorTxt += value + "\n";
  });
  return errorTxt;
}
