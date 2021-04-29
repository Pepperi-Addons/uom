import { PepperiObject, ApiFieldObject, PapiClient } from "@pepperi-addons/papi-sdk";

export class ObjectsService {
    
    private pepperiObjects: PepperiObject[] = []
    private fields: { [key: number]: ApiFieldObject[] } = {}

    constructor(private papiClient: PapiClient) {

    }

    getAtd(id: number): Promise<PepperiObject | undefined>;
    getAtd(name: string): Promise<PepperiObject | undefined>;
    async getAtd(by: number | string): Promise<PepperiObject | undefined> {
        if (!this.pepperiObjects.length) {
            this.pepperiObjects = await this.papiClient.metaData.pepperiObjects.iter().toArray();
        }

        return this.pepperiObjects.find(atd => {
            if (typeof by === 'number') {
                return by === parseInt(atd.SubTypeID);
            }
            else if (typeof by === 'string') {
                return by === atd.SubTypeName;
            }
        })
    }

    async getField(atdId: number, fieldId: string): Promise<ApiFieldObject | undefined> {
        const fields = await this.getAtdFields(atdId);
        return fields ? fields.find(field => field.FieldID === fieldId) : undefined;
    }

    async getAtdFields(atdId: number): Promise<ApiFieldObject[] | undefined> {
        debugger;
        const atd = await this.getAtd(atdId);
        if (atd) {
            if (!this.fields[atdId]) {
                this.fields[atdId] = await this.papiClient.metaData.type("transaction_lines").types.subtype(atd.SubTypeID).fields.get();
            }
        }

        return this.fields[atdId];
    }

    async getAtdTransactionLinesFields(atdId: number): Promise<ApiFieldObject[] | undefined> {
        const atd = await this.getAtd(atdId);
        if (atd) {
            if (!this.fields[atdId + '_lines']) {
                this.fields[atdId + '_lines'] = await this.papiClient.metaData.type("transaction_lines").types.subtype(atd.SubTypeID).fields.get();
            }
        }

        return this.fields[atdId + '_lines'];
    }

    async createAtdTransactionLinesFields(atdId: number, fields:ApiFieldObject[]): Promise<boolean> {
        const atd = await this.getAtd(atdId);
        if(atd) {
            const bulkURL = `/meta_data/bulk/transaction_lines/types/${atd.SubTypeID}/fields`;
            const createdFields: ApiFieldObject[] = await this.papiClient.post(bulkURL, fields);
            return createdFields.length > 0;
        }
        return false;
    }
}