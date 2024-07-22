import { PovoleniVjezduVozidlaDto } from "build/openapi";

export function newPovoleniVjezduVozidlaDto(): PovoleniVjezduVozidlaDto | any {
    return { aktivita: true, rzVozidla: [], typVozidla: [] };
}