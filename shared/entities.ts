
export const CPI_NODE_ADDON_UUID = 'bb6ee826-1c6b-4a11-9758-40a46acb69c5';

export interface Uom {
    Key: string,
    Name: string,
    Multiplier: number,
    BaseUOM: string,
    Hidden?: boolean
}
