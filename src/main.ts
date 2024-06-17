import * as _ from 'lodash';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const prefix = process.env.API_PREFIX || 'api/v1';
  if (prefix) {
    app.setGlobalPrefix(prefix);
  }
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await bootstrapSwagger(app);
  await app.listen(3000);
}


async function bootstrapSwagger(app: INestApplication) {
  const appService = await app.resolve(AppService);
  const info = appService.info();
  const version: string = _.toString(_.get(info, 'version', `unknown`));

  const config = new DocumentBuilder()
    .setTitle('@weirdnest/multi-tenant')
    .setDescription('API description')
    .setVersion(version)
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
      scheme: 'Bearer',
      name: 'Authorization',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const options = {
    explorer: true,
  };
  return SwaggerModule.setup('api/v1/docs', app, document, options);
}


bootstrap();
