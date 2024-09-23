import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get()
  ping(): string {
    return 'pong';
  }
}
