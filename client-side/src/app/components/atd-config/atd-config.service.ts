import { Injectable } from "@angular/core";
import { PepAddonService, PepHttpService, PepJwtHelperService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { ApiFieldObject, PapiClient } from "@pepperi-addons/papi-sdk";

@Injectable({ providedIn: 'root' })
export class AtdConfigService {

    accessToken = '';
    parsedToken: any
    papiBaseURL = 'https://staging.pepperi.com'
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
        public addonService:  PepAddonService
        ,public session:  PepSessionService
        ,public httpService: PepHttpService
        ,public jwtService: PepJwtHelperService
    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwtService.decodeToken(accessToken);
        //this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"]
    }

    async getAtdFields(atdID: Number): Promise<ApiFieldObject[]> {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('getAtdFields').get({'atdID': atdID});
    }
}