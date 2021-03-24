import MyService from './my.service'
import { Client, Request } from '@pepperi-addons/debug-server'
import { UomsService } from './services/uom.service'
import { ObjectsService } from './services/objects.service';
import { PapiClient } from '@pepperi-addons/papi-sdk';

export async function uoms(client: Client, request: Request) {
    const service = new UomsService(client)

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

    return await service.getAtdTransactionLinesFields(atdID);
};

// add functions here
// this function will run on the 'api/foo' endpoint
// the real function is runnning on another typescript file
export async function foo(client: Client, request: Request) {
    const service = new MyService(client)
    const res = await service.getAddons()
    return res
};

