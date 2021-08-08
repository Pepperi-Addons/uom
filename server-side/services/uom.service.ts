import { Client } from "@pepperi-addons/debug-server";
import { PapiClient } from "@pepperi-addons/papi-sdk";
import { uomsScheme } from '../metadata'
import { Uom } from "../../shared/entities";
import config from '../../addon.config.json';
import { formatDiagnostic } from "typescript";

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
        // return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').get({
        //     addon_uuid: config.AddonUUID,
        //     table: 'Uoms',
        //     ...options
        // })
    }

    async upsert(obj: Uom[]): Promise<any> {
        return this.papiClient.addons.data.uuid(config.AddonUUID).table(uomsScheme.Name).upsert(obj);
        // return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').post({
        //     addon_uuid: config.AddonUUID,
        //     table: 'Uoms'
        // }, obj);
    }
}