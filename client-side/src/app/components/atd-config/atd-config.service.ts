import { isDelegatedFactoryMetadata } from "@angular/compiler/src/render3/r3_factory";
import { Injectable } from "@angular/core";
import { PepJwtHelperService, PepSessionService } from "@pepperi-addons/ngx-lib";
import { ApiFieldObject, PapiClient } from "@pepperi-addons/papi-sdk";
import { AtdConfiguration } from "../../../../../shared/entities";

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
        public session:  PepSessionService
        ,public jwtService: PepJwtHelperService
    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwtService.decodeToken(accessToken);
        //this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"]
    }

    async getConfiguration(atdID: Number): Promise<AtdConfiguration[]> {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('atdConfiguration').get({where:'Key=' + atdID});
    }
    async isInstalled(atdID: number): Promise<boolean>{
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('isInstalled').get({'atdID': atdID});
    }
    async updateConfiguration(config: AtdConfiguration) {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('atdConfiguration').post(undefined, config);
    }

    async createTSAFields(atdID: Number): Promise<Boolean> {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('createTSAFields').post(undefined, {'atdID': atdID});
    }

    async getAtdFields(atdID: Number): Promise<ApiFieldObject[]> {
        return await this.papiClient.addons.api.uuid(this.pluginUUID).file('api').func('getAtdFields').get({'atdID': atdID});
    }

    async getTransactionTypes(): Promise<{key:number, value:string}[]> {
        const types = await this.papiClient.metaData.type('transactions').types.get();
        return types.map(item => {
            return {
                key: item.TypeID,
                value: item.ExternalID
                // uuid: item.UUID
            }
        })
    }

    async getTypeInternalID(uuid: string) {
        return  await this.papiClient.types.find({
            where: `UUID='${uuid}'`
        }).then((types) => {
            return types[0].InternalID;
        });
    }
}