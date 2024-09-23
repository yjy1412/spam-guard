import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [CardsModule],
  controllers: [AppController],
})
export class AppModule {}
