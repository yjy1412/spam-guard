import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../cards.service';

describe('CardsService', () => {
  let service: CardsService;

  const spamLinkDomains = [
    'moimingg.page.link',
    'github.com',
    'docs.github.com',
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsService],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  test('케이스 1', async () => {
    await expect(
      service.isSpam(
        'spam spam https://moiming.page.link/exam?_imcp=1',
        [spamLinkDomains[2]],
        1,
      ),
    ).resolves.toEqual(false);
  });

  test('케이스 2', async () => {
    await expect(
      service.isSpam(
        'spam spam https://moiming.page.link/exam?_imcp=1',
        [spamLinkDomains[0]],
        1,
      ),
    ).resolves.toEqual(true);
  });

  test('케이스 3', async () => {
    await expect(
      service.isSpam(
        'spam spam https://moiming.page.link/exam?_imcp=1',
        [spamLinkDomains[1]],
        2,
      ),
    ).resolves.toEqual(true);
  });

  test('케이스 4', async () => {
    await expect(
      service.isSpam(
        'spam spam https://moiming.page.link/exam?_imcp=1',
        [spamLinkDomains[2]],
        2,
      ),
    ).resolves.toEqual(false);
  });

  test('케이스 5', async () => {
    await expect(
      service.isSpam(
        'spam spam https://moiming.page.link/exam?_imcp=1',
        [spamLinkDomains[2]],
        3,
      ),
    ).resolves.toEqual(true);
  });
});
