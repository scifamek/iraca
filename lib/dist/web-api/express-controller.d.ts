import { Request, Response } from 'express';
import { Router } from 'express-serve-static-core';
import { Usecase } from '@/config';
import { Container } from '../dependency-injection';
import { MessagesConfiguration } from './messages-configuration';
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
    usecase: any;
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
    readyHandler(_request: Request, response: Response): Response<any, Record<string, any>>;
    private logParam;
    private logResponse;
    private logError;
    private logTitle;
    private makeHttpPath;
    private extractParam;
    private returnSuccessResponse;
    private returnErrorResponse;
    register<U extends Usecase<any, any>>(registerConfiguration: RegisterConfiguration): void;
    private endTransaction;
}
