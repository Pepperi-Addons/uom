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
    InventoryType: InventoryAction
}

export const InventoryActions = {
    DoNothing: 'Do Nothing',
    Fix: 'Fix Inventory',
    Color: 'Color',
}

export type InventoryAction = keyof typeof InventoryActions;
