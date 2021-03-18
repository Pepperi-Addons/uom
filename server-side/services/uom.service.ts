import { Client } from "@pepperi-addons/debug-server";
import { PapiClient } from "@pepperi-addons/papi-sdk";
import { Uom, CPI_NODE_ADDON_UUID } from "../../shared/entities";
import config from '../../addon.config.json';

export class UomsService {

    papiClient: PapiClient

    constructor (private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
        });
    }

    async find(options: any = {}): Promise<Uom[]> {
        return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').get({
            addon_uuid: config.AddonUUID,
            table: 'Uoms',
            ...options
        })
    }

    async upsert(obj: Uom[]): Promise<Uom> {
        return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').post({
            addon_uuid: config.AddonUUID,
            table: 'Uoms'
        }, obj);
    }
}