import { FetchMethodEnum } from './constants';

export class Utils {
  static async chunk<T>(arr: T[], size: number): Promise<T[][]> {
    const results: T[][] = [];

    for (let i = 0; i < arr.length; i += size) {
      results.push(arr.slice(i, i + size));
    }

    return results;
  }

  static async fetchRedirectManual(url: string): Promise<Response> {
    return await fetch(url, {
      method: FetchMethodEnum.GET,
      redirect: 'manual',
    });
  }

  static async fetchInBatches<T>(
    urls: string[],
    batchCount: number,
    fetcher: (url: string) => Promise<T>,
  ): Promise<T[]> {
    const results: T[] = [];

    for await (const urlChunk of await Utils.chunk<string>(urls, batchCount)) {
      const chunkResults = await Promise.all(urlChunk.map(fetcher));
      results.push(...chunkResults);
    }

    return results;
  }
}
