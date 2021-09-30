import { Component, Inject, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { AtdConfigService } from '../atd-config'; 
import { Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'addon-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit {
  atdID: number;
  @Input() hostObj: any;
  @Input() pluginService: AtdConfigService;
  @Input() configID: string;
  @Output() installEvent = new EventEmitter<string>();


  constructor(
    private translate: TranslateService,
    private dialogService: PepDialogService
  ) { }

  ngOnInit(): void {
    console.log("inside installation component here is the hostObject -> " ,this.hostObj);
    console.log("Inside installation component, here is AtdConfigService - > ", this.pluginService);
    this.pluginService.getTypeInternalID(this.configID).then((atdID) => {
      this.atdID = atdID;
    });
  }
  goBack(){
    return;
  }
  async install(){
        //here i need to create the TSA's 
      await this.atdID;
      this.pluginService.createTSAFields(this.atdID).then((sucsses) => {
        this.installEvent.emit('true');
    });
    console.log("installed work !!")

  }
   onInstall($event){
    this.dialogService.openDefaultDialog(new PepDialogData({
      title: 'Install',
      actionsType: 'custom',
      content: 'Are you sure you want to apply the module on the transaction?',
      actionButtons: [
        {
          title: this.translate.instant('cancel'),
          className: 'regular',
          callback: () => {
              console.log("cancel CALLBACK !!!!!!!!!!!!!!!!!!!!!!!")
              this.goBack();
          }
        },
        {
          title: this.translate.instant('ok'),
          className: 'strong',
          callback: () => {
            console.log("ok CALLBACK !!!!!!!!!!!!!!!!!!!!!!!")
            this.install();
          }
        }


      ]
    }))
    //here i need to create the TSA's 
    //   await this.atdID;
    //   this.pluginService.createTSAFields(this.atdID).then((sucsses) => {
    //     this.installEvent.emit('true');
    // });
    // console.log("installed work !!")
  }

}
