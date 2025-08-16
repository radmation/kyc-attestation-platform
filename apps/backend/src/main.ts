import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BackendModule } from './backend.module';

async function bootstrap() {
  const app = await NestFactory.create(BackendModule);

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('KYC Attestation Platform API')
    .setDescription(
      'API for KYC/AML verification and on-chain attestation management',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication and email verification endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('profiles', 'KYC profile management endpoints')
    .addTag('attestations', 'On-chain attestation management endpoints')
    .addTag('clients', 'Multi-tenant client management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
