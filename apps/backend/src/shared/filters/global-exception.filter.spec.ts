import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
      ip: '127.0.0.1',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'BadRequestException',
          message: 'Test error',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/test',
        }),
      }),
    );
  });

  it('should handle generic errors as internal server error', () => {
    const exception = new Error('Generic error');
    
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/test',
        }),
      }),
    );
  });

  it('should use request ID from headers if available', () => {
    mockRequest.headers['x-request-id'] = 'test-request-id';
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          requestId: 'test-request-id',
        }),
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const exceptionResponse = {
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: { field: 'email' },
    };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);
    
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { field: 'email' },
        }),
      }),
    );
  });
}); 