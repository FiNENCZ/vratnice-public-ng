import { CdkDragDrop, DragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-empty-page',
  template: `
  <!-- <div class="example-list"> -->
  <!-- <div cdkDropList class="example-list" (cdkDropListDropped)="drop($event)"> -->
    <!-- <div class="example-box" *ngFor="let movie of movies">{{movie}}</div> -->
    <!-- cdkDrag -->
  <!-- </div> -->
  <!-- <p-button label="Submit" (click)="nastaveni()"></p-button> -->
  `,
   styleUrls: ["./empty.page.css"]
})

// <div cdkdrag="" class="cdk-drag example-box ng-star-inserted" style="">Episode II - Attack of the Clones</div>

export class EmptyPage {

  constructor(
    protected readonly elementRef: ElementRef,
    protected readonly dragDrop: DragDrop
  ) {
  }

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX – The Rise of Skywalker',
  ];

  //drop(event: CdkDragDrop<string[]>) {
  drop(event: any) {
    console.log(event);
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  nastaveni() {
    //console.log("Nastaveni");

    var node = this.elementRef?.nativeElement.querySelector('.example-list');
    var dropList = this.dragDrop.createDropList(node);
    console.log(dropList);

    var nodeList = this.elementRef?.nativeElement.querySelectorAll('.example-box');
    console.log(nodeList);

    var seznam: any[] = new Array();

    for (let index = 0; index < nodeList.length; index++) {
      const element = nodeList[index];
      var dragRef = this.dragDrop.createDrag(element);
      seznam.push(dragRef);
      // var attributes: NamedNodeMap = element.attributes;
      // console.log(element.attributes);
      // element.setAttribute("cdkDrag", null);
      // var attr: Attr = new Attr();
      // attr.value = "cdkDrag";
      // attributes.setNamedItem(attr)
      //element.attributes.push("cdkDrag");
      // console.log(element.attributes);
    }

    dropList.withItems(seznam);
    //dropList.receivingStopped = this.drop;

    dropList.dropped.subscribe(event => {
      this.drop(event);
    });

  }


}
