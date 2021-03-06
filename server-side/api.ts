import { UOM_KEY_FIRST_TSA } from './../shared/entities';
import MyService from './my.service'
import { Client, Request } from '@pepperi-addons/debug-server'
import { UomsService } from './services/uom.service'
import { ObjectsService } from './services/objects.service';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { ConfigurationService } from './services/configuration.service';
import { UomTSAFields } from './metadata';
import { AtdConfiguration } from '../shared/entities';
import { config } from 'process';

export async function uoms(client: Client, request: Request) {
    const service = new UomsService(client);

    if (request.method == 'POST') {
        return service.upsert(request.body);
    }
    else if (request.method == 'GET') {
        return await service.find(request.query);
    }
};

export async function getUomByKey(client: Client, request: Request) {
    const service = new UomsService(client);
    let uomKey = ''

    if (request.method == 'GET' && request?.query) {
        uomKey = 'uomKey' in request.query ? request.query.uomKey : '';
    }        

    return await service.getByKey(uomKey);
}

export async function atdConfiguration(client: Client, request: Request) {
    const service = new ConfigurationService(client)

    if (request.method == 'POST') {
        return service.upsert(request.body);
    }
    else if (request.method == 'GET') {
        return await service.find(request.query);
    }
};

export async function getAtdFields(client: Client, request: Request) {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID
    });
    const service = new ObjectsService(papiClient)
    let atdID = -1;

    if (request.method == 'POST') {
        if(request?.body) {
            atdID = 'atdID' in request.body ? Number(request.body.atdID) : -1;
        }
    }
    else if (request.method == 'GET') {
        if(request?.query) {
            atdID = 'atdID' in request.query ? Number(request.query.atdID) : -1;
        }        
    }

    const items = await service.getItemsFields();
    items.forEach(item => item['FieldID'] = `Item.${item.FieldID}`);

    return [...await service.getAtdFields(atdID), ...items];
};

export async function createTSAFields(client: Client, request:Request) {
    debugger;
    let created = false;
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID

    });
    const service = new ObjectsService(papiClient)
    let atdID = -1;

    if (request.method == 'POST') {
        if(request?.body) {
            atdID = 'atdID' in request.body ? Number(request.body.atdID) : -1;
        }
    }
    else if (request.method == 'GET') {
        if(request?.query) {
            atdID = 'atdID' in request.query ? Number(request.query.atdID) : -1;
        }        
    }

    const field = await service.getField(atdID, UOM_KEY_FIRST_TSA);

    if(field == undefined) {
        created = await service.createAtdTransactionLinesFields(atdID, UomTSAFields);
    }

    return created;
}

export async function importUom(client: Client, request:Request) {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        actionUUID: client.ActionUUID,
        addonUUID: client.AddonUUID, 
        addonSecretKey: client.AddonSecretKey
    });

    const service = new ConfigurationService(client);
    const objService = new ObjectsService(papiClient);

    try {
        console.log('importUOM is called, data got from call:', request.body);
        if (request.body && request.body.Resource == 'transactions') {
            const config:AtdConfiguration = {
                Key:request.body.InternalID,
                ...request.body.DataFromExport 
            }
            await service.upsert(config);
            await objService.createAtdTransactionLinesFields(request.body.InternalID, UomTSAFields);
        }
        return {
            success:true
        }
    }
    catch(err) {
        console.log('importUom Failed with error:', err);
        return {
            success: false,
            errorMessage: 'message' in err ? err.message : 'unknown error occured'
        }
    }
}

export async function exportUom(client: Client, request:Request) {
    const service = new ConfigurationService(client);

    try {
        let config;
        console.log('exportUOM is called, data got from call:', request.query);
        if (request.query && request.query.resource  == 'transactions') {
            config = await service.find({
                where: `Key= ${request.query.internal_id}`,
            });
            if(config && config.length > 0) {
                return {
                    success:true,
                    DataForImport: {
                        UOMFieldID: config[0].UOMFieldID,
                        InventoryFieldID: config[0].InventoryFieldID,
                        InventoryType: config[0].InventoryType
                    },
                }
            }
            else {
                return {
                    success:true,
                    DataForImport: {
                    },
                }
            }
        }
        return {
            success:true,
            DataForImport: {
            },
        }
    }
    catch(err) {
        console.log('importUom Failed with error:', err);
        return {
            success: false,
            errorMessage: 'message' in err ? err.message : 'unknown error occured'
        }
    }
}

// add functions here
// this function will run on the 'api/foo' endpoint
// the real function is runnning on another typescript file
export async function foo(client: Client, request: Request) {
    const service = new MyService(client)
    const res = await service.getAddons()
    return res
};

