import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "anoNe"
})
export class AnoNePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        if (typeof value === 'boolean')
            return value ? "Ano" : "Ne";
        else
            return value;
    }
}