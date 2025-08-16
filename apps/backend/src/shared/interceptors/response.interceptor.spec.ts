import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();

    interceptor = module.get<ResponseInterceptor<any>>(ResponseInterceptor);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response data in success format', (done) => {
    const testData = { message: 'test data' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: testData,
        meta: {
          version: '1.0.0',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        },
      });
      done();
    });
  });

  it('should use request ID from headers if available', (done) => {
    const testData = { message: 'test data' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));
    
    mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
      getRequest: () => ({
        headers: { 'x-request-id': 'test-request-id' },
      }),
    });

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result.meta?.requestId).toBe('test-request-id');
      done();
    });
  });

  it('should generate request ID if not in headers', (done) => {
    const testData = { message: 'test data' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result.meta?.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      done();
    });
  });

  it('should handle null/undefined data', (done) => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: null,
        meta: {
          version: '1.0.0',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        },
      });
      done();
    });
  });

  it('should handle complex data structures', (done) => {
    const complexData = {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
      },
    };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(complexData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result.data).toEqual(complexData);
      expect(result.success).toBe(true);
      done();
    });
  });
}); 