/**
 * @heady/core - Core utilities for Heady ecosystem
 */
export declare function generateId(): string;
export declare function sleep(ms: number): Promise<void>;
export declare class Logger {
    private context;
    constructor(context: string);
    info(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
}
declare const _default: {
    generateId: typeof generateId;
    sleep: typeof sleep;
    Logger: typeof Logger;
};
export default _default;
//# sourceMappingURL=index.d.ts.map