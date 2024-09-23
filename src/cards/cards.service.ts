import { Injectable } from '@nestjs/common';

@Injectable()
export class CardsService {
  async isSpam(
    content: string,
    spamLinkDomains: string[],
    redirectionDepth: number,
  ): Promise<boolean> {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];

    for (const urlString of urls) {
      let currentUrl = urlString;
      let depth = 0;

      while (depth <= redirectionDepth) {
        try {
          const response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'follow',
          });

          if (response.ok) {
            const { hostname } = new URL(currentUrl);

            if (spamLinkDomains.includes(hostname)) {
              return true;
            }

            const body = await response.text();

            const hasSpamLinkInHtmlBody = this.checkSpamLinkDomain(
              this.findLinkDomainsFromHtmlBody(body),
              spamLinkDomains,
            );

            if (hasSpamLinkInHtmlBody) {
              return true;
            }

            break;
          }

          if (response.status === 301 || response.status === 302) {
            currentUrl = response.headers.get('location') || currentUrl;
            depth++;
          } else {
            break;
          }
        } catch (error) {
          console.error('네트워크 에러', error);
          break;
        }
      }
    }

    return false;
  }

  private findLinkDomainsFromHtmlBody(html: string): string[] {
    const anchorTagRegex = /<a href="https:\/\/([^\/"]+)/g;

    const matchResult = html.match(anchorTagRegex) || [];

    const domains = matchResult.map((match: string) => {
      const domain = match.split('https://')[1];

      return domain;
    });

    return domains;
  }

  private checkSpamLinkDomain(
    domains: string[],
    spamLinkDomains: string[],
  ): boolean {
    for (const domain of domains) {
      if (spamLinkDomains.includes(domain)) {
        return true;
      }
    }

    return false;
  }
}
