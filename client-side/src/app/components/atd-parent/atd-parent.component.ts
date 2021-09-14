import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'addon-atd-parent',
  templateUrl: './atd-parent.component.html',
  styleUrls: ['./atd-parent.component.scss']
})
export class AtdParentComponent implements OnInit {
  isInstalled: boolean = false;
  constructor() { }

  ngOnInit(): void {


  }
  installedEvent($event){
    console.log('in installedEvent at parent. parent component catch the event and change the install to true' + $event)
    this.isInstalled = $event;
  }

}
