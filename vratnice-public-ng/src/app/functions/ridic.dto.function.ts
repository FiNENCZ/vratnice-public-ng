import { RidicDto } from "build/openapi";
import { newSpolecnostDto } from "./spolecnost.dto.function";

export function newRidicDto(): RidicDto | any {
    return { aktivita: true, spolecnost: newSpolecnostDto() };
}