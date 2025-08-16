import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const morganMiddleware = morgan(
      ':remote-addr :method :url :status :res[content-length] - :response-time ms',
      {
        stream: {
          write: (message: string) => {
            this.logger.log(message.trim());
          },
        },
        skip: (req, res) => {
          // Skip health check and metrics endpoints
          return req.url === '/health' || req.url === '/metrics';
        },
      },
    );

    morganMiddleware(req, res, next);
  }
} 