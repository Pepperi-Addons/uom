import { PepperiObject, ApiFieldObject, PapiClient } from "@pepperi-addons/papi-sdk";

export class ObjectsService {
    
    private pepperiObjects: PepperiObject[] = []
    private fields: { [key: number]: ApiFieldObject[] } = {}

    constructor(private papiClient: PapiClient) {

    }

    async getField(atdId: number, fieldId: string): Promise<ApiFieldObject | undefined> {
        const fields = await this.getAtdFields(atdId);
        return fields ? fields.find(field => field.FieldID === fieldId) : undefined;
    }

    async getAtdFields(atdId: number): Promise<ApiFieldObject[] | undefined> {
        if (!this.fields[atdId]) {
            this.fields[atdId] = await this.papiClient.metaData.type("transaction_lines").types.subtype(atdId.toString()).fields.get();
        }

        return this.fields[atdId];
    }

    async getAtdTransactionLinesFields(atdId: number): Promise<ApiFieldObject[] | undefined> {
        if (!this.fields[atdId + '_lines']) {
            this.fields[atdId + '_lines'] = await this.papiClient.metaData.type("transaction_lines").types.subtype(atdId.toString()).fields.get();
        }
            
        return this.fields[atdId + '_lines'];
    }

    async createAtdTransactionLinesFields(atdId: number, fields:ApiFieldObject[]): Promise<boolean> {
        const bulkURL = `/meta_data/bulk/transaction_lines/types/${atdId}/fields`;
        const createdFields: ApiFieldObject[] = await this.papiClient.post(bulkURL, fields);
        return createdFields.length > 0;
    }
}