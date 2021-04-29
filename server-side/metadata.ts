import { ApiFieldObject } from "@pepperi-addons/papi-sdk"

export const tab = {
    Title: "Configure UOM",
    FieldID: {
        Type: "Component",
        SubType: "NG11",
        AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
        RelativeURL: 'atd_config',
        ModuleName: 'AtdConfigModule',
        ComponentName: 'AtdConfigComponent'
    }
}

export const UomTSAFields: ApiFieldObject[] = [
    {
        FieldID: "TSAAOQM_UOM1",
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
        FieldID: "TSAAOQM_UOM2",
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
        FieldID: "TSAAOQM_Quantity1",
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
        FieldID: "TSAAOQM_Quantity2",
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


