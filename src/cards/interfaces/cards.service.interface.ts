export interface CardsServiceInterface {
  isSpam(
    content: string,
    spamLinkDomains: string[],
    redirectionDepth: number,
  ): Promise<boolean>;
}
