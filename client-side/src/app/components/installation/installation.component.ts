import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'addon-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit {

  @Output() installEvent = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }

  foo(){
    this.installEvent.emit(true);
  
  }

}
