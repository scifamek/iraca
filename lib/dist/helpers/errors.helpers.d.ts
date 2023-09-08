/// <reference types="node" />
export declare function generateError(name: string, message: string): {
    new (extraData?: any): {
        toString(): string;
        formatMessage(extraData: any, message: string): string;
        name: string;
        message: string;
        stack?: string | undefined;
    };
    id: string;
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
