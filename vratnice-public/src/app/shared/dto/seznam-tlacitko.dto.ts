import { EventEmitter } from '@angular/core';

export class SeznamTlacitkoDto {
  icon: string;
  tooltip: string;
  eventEmitter: EventEmitter<any>;

  constructor(icon: string, tooltip: string, eventEmitter: EventEmitter<any>) {
    this.icon = icon;
    this.tooltip = tooltip;
    this.eventEmitter = eventEmitter;
  }
}
