import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';


class MyService {

    papiClient: PapiClient

    constructor(private client: Client) {
        this.papiClient = new PapiClient({  
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.ExecutionUUID
        });
    }

    doSomething() {
        console.log("doesn't really do anything....");
    }

    getAddons(): Promise<InstalledAddon[]> {
        return this.papiClient.addons.installedAddons.find({});
    }

    updateDataView(dataView: any) {
        var headers = {
            "X-Pepperi-ActionID": uuid(),
            "X-Pepperi-OwnerID": this.client.AddonUUID.toLowerCase(),
            "X-Pepperi-SecretKey": this.client.AddonSecretKey
        };
        return this.papiClient.post(`/meta_data/data_views`, dataView, headers);

        // return this.papiClient.metaData.dataViews.upsert(dataView);
    }
    
    getDataView(dataViewName: string): Promise<any[]> {
        return this.papiClient.metaData.dataViews.find({ where: 'Context.Name='+dataViewName,});
    }
}

export default MyService;