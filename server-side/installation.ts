
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { ApiFieldObject, PapiClient } from '@pepperi-addons/papi-sdk'
import { Fields } from '@pepperi-addons/papi-sdk/dist/endpoints';
import { atdConfigScheme, uomsScheme, relations } from './metadata';
import { ObjectsService } from './services/objects.service';

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
    
    return retVal;
}
export async function uninstall(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });
    try {
        // const headers =
        // {
        //     'X-Pepperi-SecretKey' : client.AddonSecretKey,
        //     'X-Pepperi-OwnerID': client.AddonUUID
        // } 
        
        const service = new ObjectsService(papiClient)
        //get all transactions
        const transactions = await papiClient.get('/types');
        //remove all transactions that are not transaction lines
        transactions.filter((transaction) => {
            if(transaction.Type === 2)
            {
                return true;
            }
            return false;
            }).map((transaction) => {
                //if uom is installed on that transaction then remove the relavant TSA fields
                service.getField(transaction.InternalID, 'TSAAOQMQuantity1').then((field: ApiFieldObject | undefined) => {
                         if(field != undefined  && !field.Hidden)
                         {
                            service.removeTSAFields(transaction.InternalID)
                         }
            })
            //delete the TSA's that uom created from those transaction.
        })
        
    } catch (error) {
        throw new Error('error in uninstall addonn ' + error )
    }
    return {success:true,resultObject:{}} 


    //remove_TSA_fields
    

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
async function createRelations(papiClient: PapiClient, relations) {
    try {
        await Promise.all(relations.map(async (singleRelation) => {
            await papiClient.post('/addons/data/relations', singleRelation);
        }));
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return { 
            success: false, 
            resultObject: err , 
            errorMessage: `Error in creating necessary objects . error - ${err}`
        };
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
            resultObject: err , 
            errorMessage: `Error in creating necessary objects . error - ${err}`
        };
    }
}