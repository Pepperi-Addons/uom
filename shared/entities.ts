export interface Uom {
    Key: string,
    Title: string,
    Multiplier: number,
    Hidden?: boolean
}


export interface AtdConfiguration {
    Key: string, 
    UOMFieldID: string,
    InventoryFieldID: string, 
    InventoryType: InventoryAction,
    ItemConfigFieldID: string,
    CaseQuantityType: InventoryAction
    MinQuantityType: InventoryAction
}

export const InventoryActions = {
    DoNothing: 'Do Nothing',
    Fix: 'Fix Quantity',
    Color: 'Color',
}

//thats what i need to use
export interface UomItemConfiguration {
    UOMKey: string,
    Factor: number,
    Case: number,
    Min: number
}

export type InventoryAction = keyof typeof InventoryActions;

/** Holds the quantity in UOM */
export const UNIT_QTY_FIRST_TSA = 'TSAAOQMQuantity1';
export const UNIT_QTY_SECOND_TSA = 'TSAAOQMQuantity2';
/** Holds the Key of the UOM of the line */
export const UOM_KEY_FIRST_TSA = 'TSAAOQMUOM1';
export const UOM_KEY_SECOND_TSA = 'TSAAOQMUOM2';

