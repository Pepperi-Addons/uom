
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { MenuDataView, MenuDataViewField, PapiClient } from '@pepperi-addons/papi-sdk'
import MyService from './my.service';
import { tab, relations, atdConfigScheme, uomsScheme } from './metadata';
import { stringify } from 'querystring';

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    let retVal = await createADALSchemes(papiClient);
    if(retVal.success) {
        retVal = await createRelations(papiClient, relations);
    }
    if(retVal.success) {
        retVal['tabs'] = await upsertDataView(client, "SettingsEditorTransactionsMenu", tab);
    }
    
    return retVal;
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
    }); 
    
    let retVal = await createADALSchemes(papiClient);
    if(retVal.success) {
        retVal = await createRelations(papiClient, relations);
    }
    
    return retVal;
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}


async function upsertDataView(client: Client, contextName: string, addons: any){
    const service = new MyService(client);
    const existingDataViews: DataView[] = await service.getDataView(contextName);
    if (existingDataViews?.length > 0){
        const preparedDataViews: MenuDataView[] = [];
        existingDataViews.forEach( dataView => preparedDataViews.push(updateDataViewFields(addons, dataView)));    
        const promises: Promise<any>[] = [];
        preparedDataViews.forEach(dataView => promises.push(service.updateDataView(dataView)));
        const result = await Promise.all(promises);
        return result;
    } else {
        const dataView: MenuDataView = {
            Type: "Menu",
            Context: {
                Profile: {
                    Name: "Rep"
                },
                Name: contextName,
                ScreenSize: "Landscape"     
            },
            Fields: []
        };
        const preparedDataView = updateDataViewFields(addons, dataView);
        // preparedDataView.Fields = [];
        const result = await service.updateDataView(preparedDataView);
        return result;
    }
}

function updateDataViewFields(menuField: (MenuDataViewField & any), dataView: MenuDataView & any): MenuDataView{
    const fieldId = `ADO?${stringify(menuField.FieldID)}`
    const existingFieldIndex = dataView?.Fields?.findIndex( field => field.Title === menuField.Title);
    if (existingFieldIndex > -1){
        if (dataView.Fields[existingFieldIndex].FieldID !== fieldId) {
            dataView.Fields[existingFieldIndex] = {Title: menuField.Title, FieldID: fieldId};
        }
    }
    else {
        dataView?.Fields?.push({Title: menuField.Title, FieldID: fieldId});
    }
    // dataView.Fields = [];
    return dataView;
}

async function createRelations(papiClient: PapiClient, relations) {
    try {
        relations.forEach(async (singleRelation) => {
            await papiClient.post('/addons/data/relations', singleRelation);
        });
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: ('message' in err) ? err.message : 'Unknown Error Occured',
        }
    }
}

async function createADALSchemes(papiClient: PapiClient) {
    try {
        await papiClient.addons.data.schemes.post(atdConfigScheme);
        await papiClient.addons.data.schemes.post(uomsScheme);
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: ('message' in err) ? err.message : 'Unknown Error Occured',
        }
    }
}