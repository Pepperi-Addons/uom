import '@pepperi-addons/cpi-node';
export interface QuantityResult {
    curr: number;
    total: number;
}
export declare function load(): Promise<void>;
