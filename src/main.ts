import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 유효성 검사를 할 수 있는 Pipe를 main에서 사용하겠다고 설정해야
  // class-validation을 이용할 수 있음
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
