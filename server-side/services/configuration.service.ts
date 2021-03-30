import { Client } from "@pepperi-addons/debug-server";
import { PapiClient } from "@pepperi-addons/papi-sdk";
import { AtdConfiguration, CPI_NODE_ADDON_UUID } from "../../shared/entities";
import config from '../../addon.config.json';

export class ConfigurationService {

    papiClient: PapiClient

    constructor (private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
        });
    }

    async find(options: any = {}): Promise<AtdConfiguration> {
        return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').get({
            addon_uuid: config.AddonUUID,
            table: 'AtdConfig',
            ...options
        })
    }

    async upsert(obj: AtdConfiguration): Promise<AtdConfiguration> {
        return this.papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('cpi_side_data').post({
            addon_uuid: config.AddonUUID,
            table: 'AtdConfig'
        }, obj);
    }
}