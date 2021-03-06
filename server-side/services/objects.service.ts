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

    async getAtdFields(atdId: number): Promise<ApiFieldObject[]> {
        if (!this.fields[atdId]) {
            this.fields[atdId] = await this.papiClient.metaData.type("transaction_lines").types.subtype(atdId.toString()).fields.get();
        }

        return this.fields[atdId];
    }

    async getItemsFields(): Promise<ApiFieldObject[]> {
        if (!this.fields['items']) {
            this.fields['items'] = await this.papiClient.metaData.type("items").fields.get();
        }

        return this.fields['items'];
    }

    async createAtdTransactionLinesFields(atdId: number, fields:ApiFieldObject[]): Promise<boolean> {
        const bulkURL = `/meta_data/bulk/transaction_lines/types/${atdId}/fields`;
        const createdFields: ApiFieldObject[] = await this.papiClient.post(bulkURL, fields);
        return createdFields.length > 0;
    }
}