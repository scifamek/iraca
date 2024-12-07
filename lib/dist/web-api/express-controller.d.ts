import { Request, Response } from 'express';
import { Router } from 'express-serve-static-core';
import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { MessagesConfiguration } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
export interface ExpressHandlerConfiguration {
    container: Container;
    usecaseId: string;
    response: Response;
    messageConfiguration: MessagesConfiguration;
    translatorId?: string;
    loggerId?: string;
    usecaseParam?: any;
}
export interface RegisterConfiguration {
    usecaseId: string;
    successCode?: string;
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
    path?: string;
    paramsMapper?: (param: any) => any;
}
export interface ControllerConfiguration {
    loggerId?: string;
    logger?: any;
    container: Container;
    identifier: string;
    router: any;
}
export declare abstract class ExpressController {
    protected configuration: ControllerConfiguration;
    loggerId: string;
    logger: any;
    container: Container;
    identifier: string;
    router: Router;
    constructor(configuration: ControllerConfiguration);
    abstract configureEndpoints(): void;
    private resolveLogger;
    makeErrorCode(exceptionName: string): string;
    makeErrorMessage(config: MessagesConfiguration | MessagesConfiguration, error?: Error): BaseHTTPResponse<undefined>;
    makeErrorResponse(error: Error): BaseHTTPResponse<undefined>;
    readyHandler(_request: Request, response: Response): Response<any, Record<string, any>>;
    private formatMessage;
    private logParam;
    private logResponse;
    private logError;
    private logTitle;
    private makeHttpPath;
    private getSuccessCode;
    extractParam(request: Request): any;
    register<U extends Usecase<any, any>>(registerConfiguration: RegisterConfiguration): void;
}
