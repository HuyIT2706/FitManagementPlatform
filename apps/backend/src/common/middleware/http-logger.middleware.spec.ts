import { httpLoggerMiddleware } from './http-logger.middleware';
import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

describe('httpLoggerMiddleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/health',
      ip: '127.0.0.1',
    };
    res = new EventEmitter();
    res.statusCode = 200;
    next = jest.fn();

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call next immediately', () => {
    httpLoggerMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should log info for 2xx responses on finish', () => {
    httpLoggerMiddleware(req, res, next);
    res.emit('finish');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /health 200'),
    );
  });

  it('should log warn for 4xx responses on finish', () => {
    res.statusCode = 404;
    httpLoggerMiddleware(req, res, next);
    res.emit('finish');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /health 404'),
    );
  });

  it('should log error for 5xx responses on finish', () => {
    res.statusCode = 500;
    httpLoggerMiddleware(req, res, next);
    res.emit('finish');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /health 500'),
    );
  });
});
