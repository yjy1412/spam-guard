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

            const matchResult = this.findAnchorTagFromHtmlBody(body);

            if (spamLinkDomains.includes(matchResult)) {
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

  private findAnchorTagFromHtmlBody(html: string) {
    const anchorTagRegex = /<a href="https:\/\/([^\/"]+)/;
    const match = html.match(anchorTagRegex);

    if (match) {
      return match[1];
    } else {
      return null;
    }
  }
}
