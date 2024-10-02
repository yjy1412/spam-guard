import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CardsServiceInterface } from './interfaces';
import { VerifyCardDto } from './dtos';
import { PROVIDE_TOKENS } from '../common/constants';

@Controller('app/cards')
export class CardsController {
  constructor(
    @Inject(PROVIDE_TOKENS.SERVICE.CARDS_SERVICE)
    private readonly cardsService: CardsServiceInterface,
  ) {}

  @Post('verify')
  async verifyCard(@Body() body: VerifyCardDto): Promise<boolean> {
    return this.cardsService.isSpam(
      body.content,
      body.spamLinkDomains,
      body.redirectionDepth,
    );
  }
}
