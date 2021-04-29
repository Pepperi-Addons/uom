
export const CPI_NODE_ADDON_UUID = 'bb6ee826-1c6b-4a11-9758-40a46acb69c5';

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
    InventoryType: string
}

export enum InventoryAction {
    DoNothing = 'Do Nothing',
    Fix = 'Fix Inventory',
    Color = 'Color',
}
