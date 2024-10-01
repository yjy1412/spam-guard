import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Utils } from '../common/utils';

@Injectable()
export class CardsService {
  private getDomainFromURL(url: string): string {
    const { hostname } = new URL(url);

    return hostname;
  }

  private async getLinkedURLsFromHTML(html: string): Promise<string[]> {
    const hrefRegex: RegExp = /href="([^"]*)"/g;
    const urls: string[] = Array.from(html.matchAll(hrefRegex)).map(
      (match: RegExpMatchArray) => match[1],
    );

    return urls;
  }

  private async getURLsFromContent(content: string): Promise<string[]> {
    const urlRegex: RegExp = /https?:\/\/[^\s]+/g;
    const urls: string[] = content.match(urlRegex) || [];

    return urls;
  }

  private async checkURLsSpamLinkDomainsIncluded(
    urls: string[],
    spamLinkDomains: string[],
  ): Promise<void> {
    if (urls.length === 0) {
      return;
    }

    urls.forEach((url: string) => {
      const domain = this.getDomainFromURL(url);

      if (spamLinkDomains.includes(domain)) {
        throw new BadRequestException('스팸 링크가 포함되어 있습니다.');
      }
    });
  }

  private async checkRedirectToSpamDomain(
    response: Response,
    spamLinkDomains: string[],
  ): Promise<void> {
    const redirectURL = response.headers.get('location');

    if (redirectURL) {
      const { hostname } = new URL(redirectURL);

      if (spamLinkDomains.includes(hostname)) {
        throw new BadRequestException('스팸 링크가 포함되어 있습니다.');
      }
    }
  }

  async isSpam(
    content: string,
    spamLinkDomains: string[],
    redirectionDepth: number,
  ): Promise<boolean> {
    try {
      const contentLinkedURLs = await this.getURLsFromContent(content);

      if (contentLinkedURLs.length === 0) {
        return false;
      }

      await this.checkURLsSpamLinkDomainsIncluded(
        contentLinkedURLs,
        spamLinkDomains,
      );

      const batchSize = 10;

      await Utils.fetchInBatches<void>(
        contentLinkedURLs,
        batchSize,
        async (url: string): Promise<void> => {
          let currentURL = url;
          let currentDepth = 0;

          while (currentDepth < redirectionDepth) {
            if (currentURL === null) {
              break;
            }

            try {
              const response = await Utils.fetchRedirectManual(currentURL);

              if (response.status === 301 || response.status === 302) {
                await this.checkRedirectToSpamDomain(response, spamLinkDomains);

                currentURL = response.headers.get('location') || null;
                currentDepth += 1;
                continue;
              }

              if (response.status === 200) {
                const responseString: string = await response.text();
                console.log('responseString', responseString);

                await this.checkURLsSpamLinkDomainsIncluded(
                  await this.getLinkedURLsFromHTML(responseString),
                  spamLinkDomains,
                );

                break;
              }

              break;
            } catch (error) {
              if (error instanceof BadRequestException) {
                throw error;
              }

              // NOTICE: 하나의 요청에서 에러가 발생하더라도, 스팸링크가 아니라면 다음 요청으로 넘어갑니다.
              console.error(`Error Fetching URL(${currentURL})`, error);
              break;
            }
          }
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        return true;
      }

      console.error('isSpam Error', error);
      throw new InternalServerErrorException(
        '스팸 여부를 확인하는 중에 에러가 발생했습니다.',
      );
    }

    return false;
  }
}
