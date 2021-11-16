import { AddonDataScheme, ApiFieldObject } from "@pepperi-addons/papi-sdk"
import { UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA, UOM_KEY_FIRST_TSA, UOM_KEY_SECOND_TSA } from "../shared/entities"

export interface relation {
    RelationName: string;
    AddonUUID: string;
    Name: string;
    Description: string;
    Type: "AddonAPI" | "NgComponent" | "Navigation";
    [key:string]:string;
}
//relation array that needed for uom
export const relations: relation[] = [
    {
        RelationName: "ATDImport",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"Relation from Uom addon to ATD Import addon",
        Type:"AddonAPI",
        AddonRelativeURL:"/api/import_uom"
    },
    {
        RelationName: "ATDExport",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"Relation from Uom addon to ATD Export addon",
        Type:"AddonAPI",
        AddonRelativeURL:"/api/export_uom"
    },
    {   //meta data for realtion of type NgComponent
        RelationName: "TransactionTypeListTabs",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"UOM",
        SubType: "NG11",
        ModuleName: "AtdConfigModule",
        ComponentName: "AtdConfigComponent",
        Type:"NgComponent",
        AddonRelativeURL:"atd_config"
    },
]
//the TSAs that should be created for the uom
export const UomTSAFields: ApiFieldObject[] = [
    {
        FieldID: UOM_KEY_FIRST_TSA,
        Label: "AOQM_UOM1",
        Description: "the 1st unit of measure",
        IsUserDefinedField: true,
        Hidden: false,
        UIType: {
            ID: 11,
            Name: "ComboBox",
        },
        Type: "String",
        Format: "String",
        TypeSpecificFields: {
            PicklistValues: []
        }
    },
    {
        FieldID: UOM_KEY_SECOND_TSA,
        Label: "AOQM_UOM2",
        Description: "the 2nd unit of measure",
        IsUserDefinedField: true,
        Hidden: false,
        UIType: {
            ID: 11,
            Name: "ComboBox",
        },
        Type: "String",
        Format: "String",
        TypeSpecificFields: {
            PicklistValues: []
        }
    },
    {
            FieldID: UNIT_QTY_FIRST_TSA,
            Label: "AOQM_Quantity1",
            Description: "The quantity for the 1st unit of measure",
            IsUserDefinedField: true,
            Hidden: false,
            UIType: {
                ID: 29,
                Name: "NumberRealQuantitySelector",
            },
            Type: "Number",
            Format: "Double"
        },
    {
        FieldID: UNIT_QTY_SECOND_TSA,
        Label: "AOQM_Quantity2",
        Description: "The quantity for the 2nd unit of measure",
        IsUserDefinedField: true,
        Hidden: false,
        UIType: {
            ID: 29,
            Name: "NumberRealQuantitySelector"
        },
        Type: "Number",
        Format: "Double",
    },
]
export const atdConfigScheme: AddonDataScheme = {
    Name: "AtdConfig",
    Type: "cpi_meta_data",
}
export const uomsScheme: AddonDataScheme = {
    Name: "Uoms",
    Type: "cpi_meta_data",
}


export const psaAddToCartRule = {
Type: 'Boolean',
Format: 'Boolean',
FieldID: 'PSAAddToCartRule',
Label: 'PSAAddToCartRule',
Hidden: false,
UIType: {
    "ID": 10,
    "Name": "Boolean"
},
CalculatedRuleEngine: {
    JSFormula: "return UnitsQuantity != 0",
    ParticipatingFields: [
        "UnitsQuantity"
    ],
    CalculatedOn: {
        ID: 1,
        Name: "Always"
    },
    Temporary: false
},
}