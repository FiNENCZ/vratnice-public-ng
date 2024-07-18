export function velikostSouboruFunction(fileSize: number) : string {
  var hodnota = 0;
  var koncovka = " kB";
  var bytes = fileSize;
  var kilobytes = (bytes / 1024);
  if (kilobytes > 1000) {
    var megabytes = (kilobytes / 1024);
    hodnota = megabytes;
    koncovka = " MB";
  } else {
    hodnota = kilobytes;
  }
  return hodnota.toLocaleString("cs-CZ", { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + koncovka;
}
