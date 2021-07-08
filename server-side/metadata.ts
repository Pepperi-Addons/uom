import { AddonDataScheme, ApiFieldObject } from "@pepperi-addons/papi-sdk"

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
        FieldID: "TSAAOQMUOM1",
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
        FieldID: "TSAAOQMUOM2",
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
        FieldID: "TSAAOQMQuantity1",
        Label: "AOQM_Quantity1",
        Description: "The quantity for the 1st unit of measure",
        IsUserDefinedField: true,
        UIType: {
            ID: 28,
            Name: "NumberIntegerQuantitySelector",
        },
        Type: "Integer",
        Format: "Int64"
    },
    {
        FieldID: "TSAAOQMQuantity2",
        Label: "AOQM_Quantity2",
        Description: "The quantity for the 2nd unit of measure",
        IsUserDefinedField: true,
        UIType: {
            ID: 28,
            Name: "NumberIntegerQuantitySelector"
        },
        Type: "Integer",
        Format: "Int64",
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
