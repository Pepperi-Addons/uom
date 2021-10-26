import { Component, Inject, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { AtdConfigService } from '../atd-config'; 
import { Output, EventEmitter } from '@angular/core';
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
    this.pluginService.getAtdID(this.configID).then((atdIdAndIsInstalled) => {
      this.atdID = atdIdAndIsInstalled.atdID;
    });
  }
  goBack(){
    return;
  }
  async install(){
      await this.atdID;
      console.log('atd id in installation page: ', this.atdID)
      this.pluginService.createTSAFields(this.atdID).then((sucsses) => {
        this.installEvent.emit('true');
    });
  }
   onInstall($event){
    this.dialogService.openDefaultDialog(new PepDialogData({
      title: 'Install',
      actionsType: 'custom',
      content: this.translate.instant('install_confirmation'),
      actionButtons: [
        {
          title: this.translate.instant('cancel'),
          className: 'regular',
          callback: () => {
              this.goBack();
          }
        },
        {
          title: this.translate.instant('ok'),
          className: 'strong',
          callback: () => {
            this.install();
          }
        }
      ]
    }))
  }
}
