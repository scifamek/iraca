import { Response } from 'express';
import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { DEFAULT_MESSAGES } from './code-responses';
import { MessagesConfiguration, MessagesConfigurationWithExceptions } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
import { Traslator } from './translator';
import moment = require('moment');

export abstract class HttpController {
  public static handler<U extends Usecase<any, any>>(config: {
    container: Container;
    usecaseId: string;
    response: Response;
    messageConfiguration: MessagesConfiguration;
    translatorId?: string;
    usecaseParam?: any;
  }) {
    let func = null;
    const { translatorId, container, usecaseId, usecaseParam, response, messageConfiguration } = config;
    if (translatorId) {
      const translator = container.getInstance<Traslator<any>>(translatorId).instance;
      if (translator) {
        func = translator.fromJson;
      }
    }

    this.generalHandlerController<U>(container, usecaseId, usecaseParam, func, response, messageConfiguration);
  }

  static makeErrorMessage(config: MessagesConfiguration | MessagesConfiguration, error?: Error): BaseHTTPResponse<undefined> {
    let httpMessageCode = '';
    let message = '';

    httpMessageCode = 'SERVER:ERROR';
    message = DEFAULT_MESSAGES[httpMessageCode];
    if (error && Object.keys(error).length > 0) {
      const data: Error = { ...error };

      const name = data.name;

      if (!(config as MessagesConfigurationWithExceptions).exceptions) {
        httpMessageCode = 'SERVER:ERROR';
        message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
      } else {
        const castedConfig = config as MessagesConfigurationWithExceptions;
        httpMessageCode = castedConfig.exceptions[name];

        if (httpMessageCode) {
          if (castedConfig.errorCodes) {
            message = castedConfig.errorCodes[httpMessageCode];
            message = HttpController.formatMessage(message, data);
          } else {
            message = data.message;
          }
        } else {
          httpMessageCode = 'SERVER:ERROR';
          message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
        }
      }
    }
    const code = `${config.identifier}:${httpMessageCode}`;
    return {
      meta: {
        code,
        message,
      },
    } as BaseHTTPResponse<undefined>;
  }

  public static readyHandler(_request: Request, response: Response) {
    return response.status(200).json({});
  }

  private static formatMessage(message: string, data: any) {
    if (!data) {
      return message;
    }
    const pattern = '{([A-Za-z]+)}';
    const regex = new RegExp(pattern);
    let temp = regex.exec(message);
    while (temp && temp.length > 0) {
      const key = temp[1];
      message = message.replace(`{${key}}`, data[key] || '');

      temp = regex.exec(message);
    }

    return message;
  }

  private static generalHandlerController<U extends { call: (param?: any) => any }>(
    container: Container,
    usecaseIdentifier: string,
    param: any,
    func: Function | null,
    response: Response,
    config: MessagesConfiguration
  ) {
    const logger = container.getInstance<any>('Logger').instance;
    const usecase = container.getInstance<U>(usecaseIdentifier).instance;

    let dataRes = null;
    let params = param;
    const prev = moment();
    if (!usecase) {
      const resp = this.makeErrorMessage(config);
      response.send(resp);
    } else {
      if (func) {
        if (param) {
          params = func(param);
          dataRes = usecase.call(params);
        } else {
          dataRes = usecase.call();
        }
      } else {
        if (param) {
          dataRes = usecase.call(param);
        } else {
          dataRes = usecase.call();
        }
      }

      dataRes.subscribe({
        next: (data: any) => {
          const final = moment();
          const rest = final.diff(prev, 'milliseconds');
          logger.info(`Process Time (${usecaseIdentifier}): ${rest}ms, ${rest / 1000}s`);
          let code = '';
          let message = '';
          if (typeof config.successCode == 'string') {
            code = `${config.identifier}:${config.successCode}`;
            message = DEFAULT_MESSAGES[config.successCode];
          } else {
            code = `${config.identifier}:${config.successCode.code}`;
            message = config.successCode.message || '';
          }
          message = HttpController.formatMessage(message, config.extraData);

          response.send({
            meta: {
              code,
              message,
            },
            data,
          } as BaseHTTPResponse<any>);
          logger.info('Output ', usecaseIdentifier, new Date());
        },
        error: (error: any) => {
          console.error('*:* Error:: ', error?.name, error?.message);

          const resp = this.makeErrorMessage(config, error);
          response.send(resp);
        },
        complete: () => {},
      });
    }
  }
}
