import { ResponseMeta } from './response.model';

export interface BaseMessagesConfiguration {
  extraData?: {
    [key: string]: any;
  };
  identifier: string;
  successCode: string | Partial<ResponseMeta>;
}

export interface MessagesConfigurationWithExceptions extends BaseMessagesConfiguration {
  errorCodes: {
    [index: string]: string;
  };
  exceptions: {
    [index: string]: string;
  };
}

export type MessagesConfiguration = MessagesConfigurationWithExceptions | BaseMessagesConfiguration;
