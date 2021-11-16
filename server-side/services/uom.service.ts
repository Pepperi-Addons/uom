import { Client } from "@pepperi-addons/debug-server";
import { PapiClient } from "@pepperi-addons/papi-sdk";
import { uomsScheme } from '../metadata'
import { Uom } from "../../shared/entities";
import config from '../../addon.config.json';

export class UomsService {
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
        return this.papiClient.addons.data.uuid(config.AddonUUID).table(uomsScheme.Name).find(options);
    }
    async upsert(obj: Uom[]): Promise<any> {
        return this.papiClient.addons.data.uuid(config.AddonUUID).table(uomsScheme.Name).upsert(obj);
    }
    async getByKey(uonKey: string): Promise<any> {
        try {
            return await this.papiClient.addons.data.uuid(config.AddonUUID).table(uomsScheme.Name).key(uonKey).get();
        }
        catch (e) {
            return undefined
        }
    }
}