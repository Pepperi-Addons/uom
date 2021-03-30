
export const CPI_NODE_ADDON_UUID = 'bb6ee826-1c6b-4a11-9758-40a46acb69c5';

export interface Uom {
    Key: string,
    Name: string,
    Multiplier: number,
    BaseUOM: string,
    Hidden?: boolean
}

export interface AtdConfiguration {
    Key: string, // Id of the atd this configuration belongs to
    AllowedUomMapping: string,
    InventoryMapping: string,
    InventoryAction: InventoryAction
}

export enum InventoryAction {
    DoNothing = 'Uom_InventoryAction_DoNothing',
    Correct = 'Uom_InventoryAction_Correct',
    Color = 'Uom_InventoryAction_Color',
}
