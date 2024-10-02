import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../cards.service';
import { Utils } from '../../common/utils';

describe('CardsService', () => {
  let service: CardsService;

  const spamLinkDomains = [
    'moiming.page.link',
    'github.com',
    'docs.github.com',
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsService],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  afterEach(() => {
    // NOTICE: spyOn을 초기화하려면, clearAllMocks 대신 restoreAllMocks를 사용해야 합니다.
    jest.restoreAllMocks();
  });

  test('[Case 1] 카드 Content에 스팸링크가 포함된 경우', async () => {
    jest.spyOn(Utils, 'fetchRedirectManual').mockResolvedValueOnce({
      status: 200,
    } as Response);

    await expect(
      service.isSpam(
        `spam spam https://${spamLinkDomains[0]}/exam?_imcp=1`,
        spamLinkDomains,
        3,
      ),
    ).resolves.toBe(true);
  });

  test('[Case 2] 리다이렉트 중간경로에 스팸도메인이 포함된 경우', async () => {
    jest
      .spyOn(Utils, 'fetchRedirectManual')
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://${spamLinkDomains[0]}/exam?_imcp=2`,
        }),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
      } as Response);

    await expect(
      service.isSpam('spam spam https://www.naver.com', spamLinkDomains, 2),
    ).resolves.toEqual(true);
  });

  test('[Case 3] 리다이렉트 최종경로에 스팸도메인이 포함된 경우', async () => {
    jest
      .spyOn(Utils, 'fetchRedirectManual')
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://www.google.com`,
        }),
      } as Response)
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://${spamLinkDomains[0]}/exam?_imcp=2`,
        }),
      } as Response);

    await expect(
      service.isSpam('spam spam https://www.naver.com', spamLinkDomains, 2),
    ).resolves.toEqual(true);
  });

  test('[Case 4] 리다이렉트 경로에 스팸도메인링크가 포함되었지만, 해당 리다이렉트 경로가 주어진 redirectDepth를 오버하는 경우', async () => {
    jest
      .spyOn(Utils, 'fetchRedirectManual')
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://www.google.com`,
        }),
      } as Response)
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://www.naver.com`,
        }),
      } as Response)
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://${spamLinkDomains[0]}/exam?_imcp=2`,
        }),
      } as Response);

    await expect(
      service.isSpam('spam spam https://www.naver.com', spamLinkDomains, 2),
    ).resolves.toEqual(false);
  });

  test('[Case 5] 카드 Content에 2개 이상의 링크가 포함되어 있고, 그 중 하나가 스팸링크인 경우', async () => {
    jest.spyOn(Utils, 'fetchRedirectManual').mockResolvedValueOnce({
      status: 200,
    } as Response);

    await expect(
      service.isSpam(
        `spam spam https://www.naver.com https://${spamLinkDomains[0]}/exam?_imcp=1`,
        spamLinkDomains,
        3,
      ),
    ).resolves.toBe(true);
  });

  test('[Case 6] 리다이렉트가 있었으나, 스팸도메인이 아닌 경우', async () => {
    jest.spyOn(Utils, 'fetchRedirectManual').mockResolvedValueOnce({
      status: 301,
      headers: new Headers({
        location: `https://www.naver.com`,
      }),
    } as Response);

    await expect(
      service.isSpam('spam spam https://google.com', spamLinkDomains, 2),
    ).resolves.toEqual(false);
  });

  test('[Case 7] 리다이렉트로 연결된 문서에 스팸링크가 포함되어 있는 경우', async () => {
    jest
      .spyOn(Utils, 'fetchRedirectManual')
      .mockResolvedValueOnce({
        status: 301,
        headers: new Headers({
          location: `https://www.google.com`,
        }),
      } as Response)
      .mockResolvedValueOnce(
        new Response(
          `<html><body>Here is a spam link: <a href="https://${spamLinkDomains[0]}/spams/123">Spam Link</a></body></html>`,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
            },
          },
        ),
      );

    await expect(
      service.isSpam('spam spam https://www.naver.com', spamLinkDomains, 2),
    ).resolves.toEqual(true);
  });
});
