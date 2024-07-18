import { Table } from "primeng/table";

export function nasledujiciRadekTable(table: Table, selectedRow: any): any {
  //console.log(this.getTable());
  //console.log(this.getTable().value);
  var index = (table.value as Object[]).indexOf(table.selection)
  //console.log(index);
  //console.log(this.getTable().first);
  //console.log(this.getTable().rows);

  if ((table.first! + table.rows!) <= (index + 1)) {
    //console.log("menší");
    do {
      table.first = table.first! + table.rows!;
    } while ((table.first + table.rows!) <= (index + 1));
  } else if (table.first! > (index + 1)) {
    //console.log("větší");
    do {
      table.first = table.first! - table.rows!;
    } while (table.first > (index + 1))
  }
  //console.log((this.getTable().value as Object[]).indexOf(this.getTable().selection));
  //console.log(this.getTable().selection);
  //console.log(this.getSelectedRows());
  if (index < (table.value.length - 1))
    selectedRow = table.value[index + 1]
  //this.setSelectedRows(this.getTable().value[index + 1]);
  //console.log(this.getSelectedRows());
  return selectedRow;
  //console.log(this.getTable().selection);
  //console.log(this.getTable().selection(this.getTable().value[0]));
}

export function predchazejiciRadekTable(table: Table, selectedRow: any): any {
  var index = (table.value as Object[]).indexOf(table.selection)
  //console.log(index);
  if (index == -1) index = table.value.length;
  //console.log(this.getTable().first);
  //console.log(this.getTable().rows);

  if ((table.first! + table.rows!) <= (index - 1)) {
    //console.log("menší");
    do {
      table.first = table.first! + table.rows!;
    } while ((table.first + table.rows!) <= (index - 1));
  } else if (table.first! > (index - 1) && index > 0) {
    //console.log("větší");
    do {
      table.first = table.first! - table.rows!;
    } while (table.first > (index - 1))
  }
  //console.log((this.getTable().value as Object[]).indexOf(this.getTable().selection));
  //console.log(this.getTable().selection);
  //console.log(this.getSelectedRows());
  if (index > 0)
    selectedRow = table.value[index - 1];
  //console.log(this.getSelectedRows());
  return selectedRow;
}

export function setSelectedPoObnoveni(table?: Table, novySeznam?: any[]): any {
  if (table) {
    if (table.selection) {
      var value = novySeznam?.find((element) => element.id == table.selection.id)
      return value;
    }
  }
}

