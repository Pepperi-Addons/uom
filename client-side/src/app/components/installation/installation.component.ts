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
  configID: string;
  atdID: number;
  @Input() hostObj: any;
  @Input() pluginService: AtdConfigService;
  @Output() installEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.configID = this.hostObj[0];
    console.log("inside installation component here is the hostObject -> " ,this.hostObj);
    console.log("Inside installation component, here is AtdConfigService - > ", this.pluginService);
    this.pluginService.getTypeInternalID(this.configID).then((atdID) => {
      this.atdID = atdID;
    });
  }
  async onInstall($event){
    //here i need to create the TSA's 
      await this.atdID;
      this.pluginService.createTSAFields(this.atdID).then((sucsses) => {
        this.installEvent.emit('true');
    });
    console.log("installed work !!")
  }

}
