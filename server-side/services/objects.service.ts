import { ApiFieldObject, PapiClient } from "@pepperi-addons/papi-sdk";
import { UomTSAFields, PSAAddToCartRule } from "../metadata";


export class ObjectsService {
    private fields: { [key: number]: ApiFieldObject[] } = {}

    constructor(private papiClient: PapiClient) {
    }
    async getField(atdId: number, fieldId: string): Promise<ApiFieldObject | undefined> {
        const fields = await this.getAtdFields(atdId);
        return fields ? fields.find(field => field.FieldID === fieldId) : undefined;
    }

    async isUomInstalled(atdId: number){
        return await this.getField(atdId, 'TSAAOQMQuantity1').then((field: ApiFieldObject | undefined) => {
            return field === undefined? false: !field.Hidden;
        })
    }
    async getAtdId(uuid: string){
        return  await this.papiClient.types.find({
            where: `UUID='${uuid}'`
        }).then((types) => {
            return types[0].InternalID
        });
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
    async createAtdTransactionLinesField(atdId: number, field: ApiFieldObject | undefined): Promise<boolean>{
        if(!field)
            return false;
        const createdField: ApiFieldObject = await this.papiClient.post(`/meta_data/transaction_lines/types/${atdId}/fields`, field);
        return createdField != undefined;
    }

     async isPSAExist(atdID: number, papiClient: PapiClient): Promise<boolean> {
        const transactionLinesFields =  await papiClient.metaData.type("transaction_lines").types.subtype(atdID.toString()).fields.get();
        const psaCartArray =transactionLinesFields.filter((transaction_line) => {
            return transaction_line.FieldID === 'PSAAddToCartRule' && transaction_line.Hidden == false;
        })
        return psaCartArray.length > 0;
    }
    async createAddToCartToRulePSAIfNotExist(atdID:number, papiClient: PapiClient) {
        const psaDoesNotExist = !(await this.isPSAExist(atdID, papiClient));
        if(psaDoesNotExist)
        {
            PSAAddToCartRule.Hidden = false;
            await papiClient.post(`/meta_data/transaction_lines/types/${atdID}/fields`,PSAAddToCartRule);
        }
        return;
    }
    async removeTSAFields(atdID: number){
        const tsaFields =  await Promise.all(UomTSAFields.map(async (field) => {
            return await this.getField(atdID, field.FieldID);
        }))
        const isFieldsRemoved: boolean[] = await  Promise.all(tsaFields.map((field) => {
            if(field && field.Hidden !== undefined)
                field.Hidden = true;
            return field;
        }).map((field) => {
            return this.createAtdTransactionLinesField(atdID, field);
        }));
        //return true if all fields removed successfully    
        return isFieldsRemoved.reduce((prev, curr) => {
            return prev && curr
        }, true);
    }

}