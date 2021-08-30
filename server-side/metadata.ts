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

export const relations: relation[] = [
    {
        RelationName: "ATDImport",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"Relation from Uom addon to ATD Import addon",
        Type:"AddonAPI",
        AddonRelativeURL:"/api/importUom"
    },
    {
        RelationName: "ATDExport",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"Relation from Uom addon to ATD Export addon",
        Type:"AddonAPI",
        AddonRelativeURL:"/api/exportUom"
    },
    {   //meta data for realtion of type NgComponent
        RelationName: "TransactionTypeListMenu",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        Name:"UomRelations",
        Description:"Quantity Configuration",
        SubType: "NG11",
        ModuleName: "AtdConfigModule",
        ComponentName: "AtdConfigComponent",
        Type:"NgComponent",
        AddonRelativeURL:"atd_config"
    },
    // {
    //     RelationName: "TransactionTypeListMenu",
    //     AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
    //     Name:"UomRelations",
    //     Description:"Configure UOM",
    //     Type:"NgComponent",
    //     AddonRelativeURL:"atd_config",
    //     SubType: "NG11",
    //     ModuleName: 'AtdConfigModule',
    //     ComponentName: 'AtdConfigComponent'
    // },
]

export const UomTSAFields: ApiFieldObject[] = [
    {
        FieldID: UOM_KEY_FIRST_TSA,
        Label: "AOQM_UOM1",
        Description: "the 1st unit of measure",
        IsUserDefinedField: true,
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
        UIType: {
            ID: 8,
            Name: "NumberReal",
        },
        Type: "Number",
        Format: "Double",
        TypeSpecificFields: {
            "DecimalScale": 6
        }
    },
    {
        FieldID: UNIT_QTY_SECOND_TSA,
        Label: "AOQM_Quantity2",
        Description: "The quantity for the 2nd unit of measure",
        IsUserDefinedField: true,
        UIType: {
            ID: 8,
            Name: "NumberReal"
        },
        Type: "Number",
        Format: "Double",
        TypeSpecificFields: {
            "DecimalScale": 6
        }
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
