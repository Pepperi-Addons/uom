import { uomsScheme } from "../server-side/metadata";
import { AtdConfiguration, Uom } from "../shared/entities";
import config from '../addon.config.json';


export class DataService {
    private configurations: AtdConfiguration[] = []
    private UomsMap!: Map<string, Uom>;

    constructor() {}

    async initData() {
        this.configurations = await this.getAtdConfigurationArray();
        const uomsList = await this.getUomArray(uomsScheme.Name);
        this.UomsMap = new Map<string, Uom>(uomsList.map(item => {
            return [item.Key, item];
        }))
    }

    getUomByKey(uomKey: string): Uom | undefined {
        return this.UomsMap.get(uomKey);
    }

    getConfigObject(atdID: number) {
        return this.configurations.find(item => {
            return Number(item.Key) === atdID
        })
    }

    private async getUomArray(tableName:string): Promise<Uom[]>
    {
        return (await pepperi.api.adal.getList({
            table: tableName,
            addon: config.AddonUUID
        })).objects as Uom[];
        
    }

    private async getAtdConfigurationArray(): Promise<AtdConfiguration[]>
    {
        return (await pepperi.api.adal.getList({
            table: 'AtdConfig',
            addon: config.AddonUUID
        })).objects as AtdConfiguration[];
    }
}