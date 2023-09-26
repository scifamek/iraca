import { Response } from 'express';
import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { MessagesConfiguration } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
export interface HandlerConfiguration {
    container: Container;
    usecaseId: string;
    response: Response;
    messageConfiguration: MessagesConfiguration;
    translatorId?: string;
    loggerId?: string;
    usecaseParam?: any;
}
export declare abstract class HttpController {
    static loggerId: string;
    static logger: any;
    static handler<U extends Usecase<any, any>>(config: HandlerConfiguration): void;
    static makeErrorMessage(config: MessagesConfiguration | MessagesConfiguration, error?: Error): BaseHTTPResponse<undefined>;
    static readyHandler(_request: Request, response: Response): Response<any, Record<string, any>>;
    private static formatMessage;
    private static generalHandlerController;
}
