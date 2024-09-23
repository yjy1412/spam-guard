import { Body, Controller, Post } from '@nestjs/common';
import { CardsService } from './cards.service';
import { VerifyCardDto } from './dtos';

@Controller('app/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('verify')
  async verifyCard(@Body() body: VerifyCardDto): Promise<boolean> {
    return this.cardsService.isSpam(
      body.content,
      body.spamLinkDomains,
      body.redirectionDepth,
    );
  }
}
