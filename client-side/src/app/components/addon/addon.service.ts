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
            token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiYTFjNzJmMTI3NThjYzEzMzg3ZWQ3YTBiZjNlODg3IiwidHlwIjoiSldUIn0.eyJuYmYiOjE2MTYwNTkyNjUsImV4cCI6MTYxNjA2Mjg2NSwiaXNzIjoiaHR0cHM6Ly9pZHAuc2FuZGJveC5wZXBwZXJpLmNvbSIsImF1ZCI6WyJodHRwczovL2lkcC5zYW5kYm94LnBlcHBlcmkuY29tL3Jlc291cmNlcyIsInBlcHBlcmkuYXBpbnQiLCJwZXBwZXJpLndlYmFwcF9hcGkiXSwiY2xpZW50X2lkIjoicGVwcGVyaS53ZWJhcHAuYXBwLnNhbmRib3gucGVwcGVyaS5jb20iLCJzdWIiOiI4NDNlNmM1Ny00YTNhLTRiMTMtYWIxOC04ZTdjODIyOGQyYmQiLCJhdXRoX3RpbWUiOjE2MTYwNTU2NzksImlkcCI6ImxvY2FsIiwiZW1haWwiOiJleWFsLnJAcGVwcGVyaXRlc3QuY29tIiwicGVwcGVyaS5pZCI6MjIzMjM3LCJwZXBwZXJpLnVzZXJ1dWlkIjoiODQzZTZjNTctNGEzYS00YjEzLWFiMTgtOGU3YzgyMjhkMmJkIiwicGVwcGVyaS5kaXN0cmlidXRvcmlkIjo3ODEyMzMyLCJwZXBwZXJpLmRpc3RyaWJ1dG9ydXVpZCI6IjE1YTU5ZDUyLTRjYzgtNGU0OC04NzQ1LWFiYTA5MjRhNDJlMyIsInBlcHBlcmkuZGF0YWNlbnRlciI6InNhbmRib3giLCJwZXBwZXJpLmFwaW50YmFzZXVybCI6Imh0dHBzOi8vcmVzdGFwaS5zYW5kYm94LnBlcHBlcmkuY29tIiwicGVwcGVyaS5lbXBsb3llZXR5cGUiOjEsInBlcHBlcmkuYmFzZXVybCI6Imh0dHBzOi8vcGFwaS5zdGFnaW5nLnBlcHBlcmkuY29tL1YxLjAiLCJwZXBwZXJpLndhY2RiYXNldXJsIjoiaHR0cHM6Ly9jcGFwaS5zdGFnaW5nLnBlcHBlcmkuY29tIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInBlcHBlcmkud2ViYXBwX2lkZW50aXR5IiwicGVwcGVyaS5wcm9maWxlIiwicGVwcGVyaS5hcGludCIsInBlcHBlcmkud2ViYXBwX2FwaSJdLCJhbXIiOlsicHdkIl19.CNY1P0Jr87STfkEcmqBd5vDDOCeMTLUNDdbOmlOXnLm-egx-rR35ca0u6qD19JFUeWAZd3jJYYiGQJnh6MAKx1rwBQ2Od4Ph3yh_q_eOy4kx-2XyMej5k2x0r88y8oEKW9947OVrzbb4GM2Roas71m3nFid32XRbpk-VSD8forRQrlH2NvYsaYs2Lx-Fofh8-6i1EEJ2idfYuRRJ8UgTMiUBJIhDhj4Q9Gj-Chcv6T0HLS50bzkcIp70C7DnHpca9vq5jXIk7X02nqDwHPaH4JBfO7Hw1ee3X_DT98sX3KkFu9wYOWBZ65xSZLTbVay9UTGrUl3OvIEDKZKTFyfudw',//this.session.getIdpToken(),
            addonUUID: this.pluginUUID,
            suppressLogging:true
        })
    }

    constructor(
        public addonService:  PepAddonService
        ,public session:  PepSessionService
        ,public httpService: PepHttpService
        ,public pepperiDataConverter: PepDataConvertorService
        ,public dialogService: PepDialogService
    ) {
        const accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiYTFjNzJmMTI3NThjYzEzMzg3ZWQ3YTBiZjNlODg3IiwidHlwIjoiSldUIn0.eyJuYmYiOjE2MTYwNTkyNjUsImV4cCI6MTYxNjA2Mjg2NSwiaXNzIjoiaHR0cHM6Ly9pZHAuc2FuZGJveC5wZXBwZXJpLmNvbSIsImF1ZCI6WyJodHRwczovL2lkcC5zYW5kYm94LnBlcHBlcmkuY29tL3Jlc291cmNlcyIsInBlcHBlcmkuYXBpbnQiLCJwZXBwZXJpLndlYmFwcF9hcGkiXSwiY2xpZW50X2lkIjoicGVwcGVyaS53ZWJhcHAuYXBwLnNhbmRib3gucGVwcGVyaS5jb20iLCJzdWIiOiI4NDNlNmM1Ny00YTNhLTRiMTMtYWIxOC04ZTdjODIyOGQyYmQiLCJhdXRoX3RpbWUiOjE2MTYwNTU2NzksImlkcCI6ImxvY2FsIiwiZW1haWwiOiJleWFsLnJAcGVwcGVyaXRlc3QuY29tIiwicGVwcGVyaS5pZCI6MjIzMjM3LCJwZXBwZXJpLnVzZXJ1dWlkIjoiODQzZTZjNTctNGEzYS00YjEzLWFiMTgtOGU3YzgyMjhkMmJkIiwicGVwcGVyaS5kaXN0cmlidXRvcmlkIjo3ODEyMzMyLCJwZXBwZXJpLmRpc3RyaWJ1dG9ydXVpZCI6IjE1YTU5ZDUyLTRjYzgtNGU0OC04NzQ1LWFiYTA5MjRhNDJlMyIsInBlcHBlcmkuZGF0YWNlbnRlciI6InNhbmRib3giLCJwZXBwZXJpLmFwaW50YmFzZXVybCI6Imh0dHBzOi8vcmVzdGFwaS5zYW5kYm94LnBlcHBlcmkuY29tIiwicGVwcGVyaS5lbXBsb3llZXR5cGUiOjEsInBlcHBlcmkuYmFzZXVybCI6Imh0dHBzOi8vcGFwaS5zdGFnaW5nLnBlcHBlcmkuY29tL1YxLjAiLCJwZXBwZXJpLndhY2RiYXNldXJsIjoiaHR0cHM6Ly9jcGFwaS5zdGFnaW5nLnBlcHBlcmkuY29tIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInBlcHBlcmkud2ViYXBwX2lkZW50aXR5IiwicGVwcGVyaS5wcm9maWxlIiwicGVwcGVyaS5hcGludCIsInBlcHBlcmkud2ViYXBwX2FwaSJdLCJhbXIiOlsicHdkIl19.CNY1P0Jr87STfkEcmqBd5vDDOCeMTLUNDdbOmlOXnLm-egx-rR35ca0u6qD19JFUeWAZd3jJYYiGQJnh6MAKx1rwBQ2Od4Ph3yh_q_eOy4kx-2XyMej5k2x0r88y8oEKW9947OVrzbb4GM2Roas71m3nFid32XRbpk-VSD8forRQrlH2NvYsaYs2Lx-Fofh8-6i1EEJ2idfYuRRJ8UgTMiUBJIhDhj4Q9Gj-Chcv6T0HLS50bzkcIp70C7DnHpca9vq5jXIk7X02nqDwHPaH4JBfO7Hw1ee3X_DT98sX3KkFu9wYOWBZ65xSZLTbVay9UTGrUl3OvIEDKZKTFyfudw';//this.session.getIdpToken();
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
