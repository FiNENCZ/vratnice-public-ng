import { Pipe, PipeTransform } from "@angular/core";
//import { DatePipe, CurrencyPipe, DecimalPipe } from "@angular/common";
@Pipe({
  name: "field"
})
export class FieldPipe implements PipeTransform {
  /**
   *
   */
  transform(value: any, ...args: any[]): any {
    const column: any = args[0];
    let result = value;
    // addressModel.City.Name
    column.field.split(".").forEach((f:any) => {
      if (result) {
        result = result[f];
      }
    });
    return result;
  }
}
