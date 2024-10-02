import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PROVIDE_TOKENS } from '../common/constants';

@Module({
  controllers: [CardsController],
  providers: [
    {
      provide: PROVIDE_TOKENS.SERVICE.CARDS_SERVICE,
      useClass: CardsService,
    },
  ],
})
export class CardsModule {}
