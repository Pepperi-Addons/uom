import { Client } from "@pepperi-addons/debug-server";
import { PapiClient } from "@pepperi-addons/papi-sdk";
import { AtdConfiguration } from "../../shared/entities";
import config from '../../addon.config.json';
import { atdConfigScheme } from "../metadata";

export class ConfigurationService {
    papiClient: PapiClient

    constructor (private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.ActionUUID
        });
    }
    async find(options: any = {}): Promise<any> {
        return await this.papiClient.addons.data.uuid(config.AddonUUID).table(atdConfigScheme.Name).find(options);
    }
    async uninstall(options): Promise<any>{
        try{
            const atdConfig = await this.find(options);
            atdConfig.Hidden = true;
            return this.upsert(atdConfig)
        }catch(exception){
            return {};
        } 
    }
    async upsert(obj: AtdConfiguration): Promise<any> {
        return await this.papiClient.addons.data.uuid(config.AddonUUID).table(atdConfigScheme.Name).upsert(obj);
    }
}