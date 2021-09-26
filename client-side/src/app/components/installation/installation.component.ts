import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { AtdConfigService } from '../atd-config'; 
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'addon-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit {
  configID: number;
  atdID: number;
  @Input() hostObj: any;
  @Input() pluginService: AtdConfigService;
  @Output() installEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    // this.configID = this.hostObj[0];
    // console.log("inside installation component here is the hostObject -> " ,this.hostObj);
    // console.log("Inside installation component, here is AtdConfigService - > ", this.pluginService);
  }
  onInstall($event){
    //here i need to create the TSA's 
    // this.pluginService.createTSAFields(this.atdID);

    //after that i need to go back to the atd-config component with isInstalled set to true.


    console.log("installed work !!")
    this.installEvent.emit('true');
  }

}
