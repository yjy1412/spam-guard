import { Injectable } from '@nestjs/common';

@Injectable()
export class CardsService {
  async isSpam(
    content: string,
    spamLinkDomains: string[],
    redirectionDepth: number,
  ): Promise<boolean> {
    console.log(content, spamLinkDomains, redirectionDepth);

    return true;
  }
}
