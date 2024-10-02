import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from '../cards.controller';
import { PROVIDE_TOKENS } from '../../common/constants';

describe('CardsController', () => {
  let controller: CardsController;

  const mockCardsService = {
    isSpam: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: PROVIDE_TOKENS.SERVICE.CARDS_SERVICE,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('[Case 1] 카드 Content에 스팸링크가 포함된 경우', async () => {
    mockCardsService.isSpam.mockResolvedValueOnce(true);

    await expect(
      controller.verifyCard({
        content: `spam spam https://moiming.page.link/exam?_imcp=1`,
        spamLinkDomains: ['moiming.page.link', 'github.com', 'docs.github.com'],
        redirectionDepth: 3,
      }),
    ).resolves.toBe(true);
  });

  test('[Case 2] 리다이렉트 중간경로에 스팸도메인이 포함된 경우', async () => {
    mockCardsService.isSpam.mockResolvedValueOnce(true);

    await expect(
      controller.verifyCard({
        content: 'spam spam https://www.naver.com',
        spamLinkDomains: ['moiming.page.link', 'github.com', 'docs.github.com'],
        redirectionDepth: 2,
      }),
    ).resolves.toBe(true);
  });

  test('[Case 3] 리다이렉트 최종경로에 스팸도메인이 포함된 경우', async () => {
    mockCardsService.isSpam.mockResolvedValueOnce(true);

    await expect(
      controller.verifyCard({
        content: 'spam spam https://www.naver.com',
        spamLinkDomains: ['moiming.page.link', 'github.com', 'docs.github.com'],
        redirectionDepth: 1,
      }),
    ).resolves.toBe(true);
  });
});
