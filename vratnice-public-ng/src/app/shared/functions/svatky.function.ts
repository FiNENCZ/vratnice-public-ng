const svatky = [[1, 1], [1, 5], [8, 5], [5, 7], [6, 7], [28, 9], [28, 10], [17, 11], [24, 12], [25, 12], [26, 12]];

export function isSvatekDatum(datum: Date): boolean {
    return isSvatek(datum.getDate(), datum.getMonth(), datum.getFullYear());
}

export function isSvatek(den: number, mesic: number, rok: number): boolean {
    //Výpočet velikonoc a pridání do seznamu svátků
    //Výpočet provádím jen pokud je měsíc březen nebo duben
    let svatkyKomplet = svatky;
    if (mesic == 2 || mesic == 3) {
        svatkyKomplet = svatkyKomplet.concat(getEaster(rok));
    }
    //console.log(svatkyKomplet);
    for (let index = 0; index < svatkyKomplet.length; index++) {
        const svatek = svatkyKomplet[index];
        if (den == svatek[0] && (mesic + 1) == svatek[1]) {
            return true;
        }
    }
    //console.log(den, mesic, rok);
    return false;
}

function getEaster(year: number): number[][] {
    var f = Math.floor,
        // Golden Number - 1
        G = year % 19,
        C = f(year / 100),
        // related to Epact
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        // number of days from 21 March to the Paschal full moon
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        // weekday for the Paschal full moon
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        // number of days from 21 March to the Sunday on or before the Paschal full moon
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    let datumPatek = new Date(year, month - 1, day - 2);
    let datumPondeli = new Date(year, month - 1, day + 1);
    return [[datumPatek.getDate(), datumPatek.getMonth() + 1], [datumPondeli.getDate(), datumPondeli.getMonth() + 1]];
}