import { Response } from 'express';
import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { MessagesConfiguration } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
export declare abstract class HttpController {
    static handler<U extends Usecase<any, any>>(config: {
        container: Container;
        usecaseId: string;
        response: Response;
        messageConfiguration: MessagesConfiguration;
        translatorId?: string;
        usecaseParam?: any;
    }): void;
    static makeErrorMessage(config: MessagesConfiguration | MessagesConfiguration, error?: Error): BaseHTTPResponse<undefined>;
    static readyHandler(_request: Request, response: Response): Response<any, Record<string, any>>;
    private static formatMessage;
    private static generalHandlerController;
    private static getKeys;
}
