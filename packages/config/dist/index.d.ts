/**
 * @heady/config - Configuration management for Heady ecosystem
 */
export interface HeadyConfig {
    apiKey?: string;
    databaseUrl?: string;
    redisUrl?: string;
    nodeEnv?: string;
}
export declare function loadConfig(): HeadyConfig;
declare const _default: {
    loadConfig: typeof loadConfig;
};
export default _default;
//# sourceMappingURL=index.d.ts.map