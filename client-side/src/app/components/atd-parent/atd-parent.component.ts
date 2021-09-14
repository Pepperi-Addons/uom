import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'addon-atd-parent',
  templateUrl: './atd-parent.component.html',
  styleUrls: ['./atd-parent.component.scss']
})
export class AtdParentComponent implements OnInit {
  isInsatlled: boolean = false;
  constructor() { }

  ngOnInit(): void {
    

  }
  installedEvent($event){
    this.isInsatlled = $event;
  }

}
