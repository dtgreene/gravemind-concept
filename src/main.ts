import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { AppModule } from 'src/app.module';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';

const logger = new Logger('App');

async function main() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Middleware
  app.enableCors({
    credentials: true,
    origin: config.get('app.origin'),
  });
  app.use('/v1/healthcheck/network', (_req: Request, res: Response) => {
    // HealthCheck Route is registered as middleware to circumvent the
    // AuthGuard.
    res.sendStatus(204);
  });

  app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(AuthService)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        ignoreDecorators: true,
      },
    })
  );

  // Start server
  const port = config.get('app.port');
  const server = await app.listen(port);

  // The default is 30 seconds so setting this to 60 seconds
  server.setTimeout(60_000);
  if (server.listening) {
    logger.log(`Listening on port "${port}"`);
  } else {
    logger.error(`Underlying server is not listening.`);
  }
}

try {
  main();
} catch (error) {
  // we can get here with invalid GraphQL schemas
  console.error(`Application bootstrap failed: `, error);
  // Do not rethrow or we will get unhandled promise rejections
  process.exitCode = 1;
}
