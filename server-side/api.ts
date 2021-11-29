import { UOM_KEY_FIRST_TSA } from './../shared/entities';
import { Client, Request } from '@pepperi-addons/debug-server'
import { UomsService } from './services/uom.service'
import { ObjectsService } from './services/objects.service';
import { ApiFieldObject, PapiClient } from '@pepperi-addons/papi-sdk';
import { ConfigurationService } from './services/configuration.service';
import { UomTSAFields } from './metadata';
import { AtdConfiguration } from '../shared/entities';


export async function uoms(client: Client, request: Request) {
    const service = new UomsService(client);

    if (request.method == 'POST') 
    {
        return service.upsert(request.body);
    }
    else if (request.method == 'GET')
    {
        return await service.find(request.query);
    }
    else
    {
        throw new Error('expected to recive GET/POST method, but instead recived ' + request.method);
    }
};
export async function  get_atd_id(client: Client, request: Request) {
    if(request.method != 'GET')
    {
        throw new Error('expected to recive GET method, but instead recived ' + request.method);
    }
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID
    });
    const service = new ObjectsService(papiClient);
    let uuid = '';
    if('uuid' in request?.query)
    {
        uuid = request.query.uuid
    }
    const atdID = await service.getAtdId(uuid);
    const isInstalled = await service.getField(atdID, 'TSAAOQMQuantity1').then((field: ApiFieldObject | undefined) => {
        return field === undefined? false: !field.Hidden;
    });
    return {'atdID': atdID, 'isInstalled': isInstalled};
    // return await service.getAtdId(uuid)
};
export async function remove_atd_configurations(client: Client, request: Request){
    if(request.method !=  'POST')
    {
        throw new Error('expected to recive POST method, but instead recived ' + request.method);
    }
        
   const service = new ConfigurationService(client);
   return await service.uninstall(request.body);

}
export async function get_uom_by_key(client: Client, request: Request) {
    if(request.method != 'GET')
    {
        throw new Error('expected to recive GET method, but instead recived ' + request.method);
    }
    const service = new UomsService(client);
    let uomKey = ''
    if (request?.query)
    {
        uomKey = 'uomKey' in request.query ? request.query.uomKey : '';
    }        
    return await service.getByKey(uomKey);
}
export async function atd_configuration(client: Client, request: Request) {
    const service = new ConfigurationService(client)
    if (request.method == 'POST')
    {
        return service.upsert(request.body);
    }
    else if (request.method == 'GET')
    {
        return await service.find(request.query);
    }
    else
    {
        throw new Error('expected to recive GET/POST method, but instead recived ' + request.method);
    }
};
export async function get_atd_fields(client: Client, request: Request) {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID
    });
    const service = new ObjectsService(papiClient)
    let atdID = -1;

    if (request.method == 'POST')
    {
        if(request?.body)
        {
            atdID = 'atdID' in request.body ? Number(request.body.atdID) : -1;
        }
    }
    else if (request.method == 'GET')
    {
        if(request?.query)
        {
            atdID = 'atdID' in request.query ? Number(request.query.atdID) : -1;
        }        
    }
    else
    {
        throw new Error('expected to recive GET/POST method, but instead recived ' + request.method);
    }
    if(atdID === -1)
    {
        return [{}];
    }
    const items = await service.getItemsFields();
    items.forEach(item => item['FieldID'] = `Item.${item.FieldID}`);
    return [...await service.getAtdFields(atdID), ...items];
}
export async function remove_tsa_fields(client: Client, request: Request): Promise<boolean> {
    if(request.method !=  'POST')
    {
        throw new console.error("expected to recive POST method but instead recived " + request.method );
    }
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID

    });
    const service = new ObjectsService(papiClient);
    let atdID = -1;
    if(request?.query)
    {
        atdID = 'atdID' in request.query? Number(request.query.atdID) : -1;
    }
    if(request?.body)
    {
        atdID = 'atdID' in request.body? Number(request.body.atdID): -1;
    }
    return await service.removeTSAFields(atdID);
}

export async function create_tsa_fields(client: Client, request:Request) {
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

    if (request.method == 'POST')
    {
        if(request?.body)
        {
            atdID = 'atdID' in request.body ? Number(request.body.atdID) : -1;
        }
    }
    else if (request.method == 'GET')
    {
        if(request?.query)
        {
            atdID = 'atdID' in request.query ? Number(request.query.atdID) : -1;
        }        
    }
    else
    {
        throw new Error('expected to recive GET/POST method, but instead recived ' + request.method);
    }
    const papiClientWithoudUUID = new PapiClient({
        token: client.OAuthAccessToken,
        baseURL: client.BaseURL
    })
    await service.createAddToCartToRulePSAIfNotExist(atdID, papiClientWithoudUUID);
    const field = await service.getField(atdID, UOM_KEY_FIRST_TSA);
    if(field == undefined)
    {
        created = await service.createAtdTransactionLinesFields(atdID, UomTSAFields);
    }

    return created;
}

export async function is_installed(client:Client, request:Request):Promise<boolean>{
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID

    });
    if(request.method != 'GET')
    {
        throw new Error('expected to recive GET method, but instead recived ' + request.method);
    }
    const service = new ObjectsService(papiClient);
    let atdID = 'atdID' in request.query ? Number(request.query.atdID): -1;
    //isUomInstalled
    return await service.isUomInstalled(atdID);
}
export async function import_uom(client: Client, request:Request) {

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
        if (request.body && request.body.Resource == 'transactions' && Object.keys(request.body.DataFromExport).length > 0 )
        {
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
export async function export_uom(client: Client, request:Request) {
    const service = new ConfigurationService(client);
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        actionUUID: client.ActionUUID,
        addonUUID: client.AddonUUID, 
        addonSecretKey: client.AddonSecretKey
    });
    const objService = new ObjectsService(papiClient);
    try {
        let result = {
            success: true,
            DataForImport: {}
        }
        const isUOMInstalled = await objService.isUomInstalled(request.query.internal_id);
        // if(!isUOMInstalled)
        // {
        //     return {
        //         success:true,
        //         DataForImport: {}
        //     }
        // }
        let config;
        if (request.query && request.query.resource  == 'transactions' && isUOMInstalled)
        {
            config = await service.find({
                where: `Key= ${request.query.internal_id}`,
            });
            if(config && config.length > 0)
            {
                result = {
                    success:true,
                    DataForImport: {
                        UOMFieldID: config[0].UOMFieldID,
                        InventoryFieldID: config[0].InventoryFieldID,
                        InventoryType: config[0].InventoryType,
                        ItemConfigFieldID: config[0].ItemConfigFieldID || undefined,
                        CaseQuantityType: config[0].CaseQuantityType || undefined,
                        MinQuantityType: config[0].MinQuantityType || undefined
                    }
                }
            }
            // else
            // {
            //     return {
            //         success:true,
            //         DataForImport: {
            //         },
            //     }
            // }
        }
        return result;
    }
    catch(err) {
        console.log('importUom Failed with error:', err);
        return {
            success: false,
            errorMessage: 'message' in err ? err.message : 'unknown error occured'
        }
    }
}

export async function remove_tsa_and_atd(client: Client, request:Request)
{
    if(request.method != 'POST')
    {
        throw new Error('expected to recive POST method, but instead recived ' + request.method);   
    }
    if(!('key' in request.body))
    {
        throw new Error('remove_tsa_and_atd: must include key inside request.body');
    }
    await remove_atd_configurations(client,request);
    request.body.atdID = request.body.key;
    await remove_tsa_fields(client,request);
    return;
}

