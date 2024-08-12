import { PovoleniVjezduVozidlaDto } from "build/openapi";
import { newRidicDto } from "./ridic.dto.function";

export function newPovoleniVjezduVozidlaDto(): PovoleniVjezduVozidlaDto | any {
    return { aktivita: true, rzVozidla: [], typVozidla: [] };
}