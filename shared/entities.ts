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
    CaseType: InventoryAction
}

export const InventoryActions = {
    DoNothing: 'Do Nothing',
    Fix: 'Fix Inventory',
    Color: 'Color',
}

export interface UomItemConfiguration {
    UOMKey: string,
    Factor: number,
    Case: number,
    Min: number
}

export type InventoryAction = keyof typeof InventoryActions;
