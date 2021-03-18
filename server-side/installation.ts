
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient } from '@pepperi-addons/papi-sdk'
import { CPI_NODE_ADDON_UUID } from '../shared/entities';
import config from '../addon.config.json'

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
    });

    await papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('files').post({},{
        AddonUUID: config.AddonUUID,
        Files: ['uom-app.js'],
        Version: request.body.ToVersion
    })

    return {success:true,resultObject:{}}
}

export async function uninstall(client: Client, request: Request): Promise<any> {

    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
    });

    await papiClient.addons.api.uuid(CPI_NODE_ADDON_UUID).file('cpi_node').func('files').post({},{
        AddonUUID: config.AddonUUID,
        Files: ['uom-app.js'],
        Version: request.body.ToVersion
    })

    return {success:true,resultObject:{}}
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}
