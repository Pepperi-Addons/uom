import jwt from 'jwt-decode';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { Injectable } from '@angular/core';

import {PepAddonService, PepHttpService, PepDataConvertorService, PepSessionService} from '@pepperi-addons/ngx-lib';

import { PepDialogActionsType, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { Uom } from '../../../../../shared/entities';

@Injectable({ providedIn: 'root' })
export class AddonService {

    accessToken = '';
    parsedToken: any
    papiBaseURL = ''
    pluginUUID;
    dialogRef;

    get papiClient(): PapiClient {
        return new PapiClient({
            baseURL: this.papiBaseURL,
            token: this.session.getIdpToken(),
            addonUUID: this.pluginUUID,
            suppressLogging:true
        })
    }

    constructor(
        public session:  PepSessionService
        ,public pepperiDataConverter: PepDataConvertorService
        ,public dialogService: PepDialogService
    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"]
    }

    async getUoms(): Promise<Uom[]> {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('uoms').get();
    }

    async updateUoms(data: Uom) {
        await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('uoms').post(undefined, data);
    }

    openDialog(title = 'Modal Test', content, buttons,
        input , callbackFunc = null): void {
        const dialogConfig = this.dialogService.getDialogConfig({disableClose: true, panelClass:'pepperi-standalone'}, 'inline')
        const data = new PepDialogData({title: title, type:'custom', content:content, actionButtons: buttons})
        dialogConfig.data = data;
        
        this.dialogRef = this.dialogService.openDialog(content, input, dialogConfig);
        this.dialogRef.afterClosed().subscribe(res => {
                    callbackFunc(res);
        });
    } 

    openTextDialog(title, content, buttons, dialogType: PepDialogActionsType ) {
        const data = new PepDialogData({title: title, content: content, type: dialogType, actionButtons: buttons});
        const config = this.dialogService.getDialogConfig({}, 'inline')
        this.dialogService.openDefaultDialog(data, config);
    }
}
