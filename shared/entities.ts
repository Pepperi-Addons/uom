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
