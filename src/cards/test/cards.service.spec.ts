import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../cards.service';

describe('CardsService', () => {
  let service: CardsService;

  const spamLinkDomains = ['www.naver.com', 'www.daum.net', 'www.google.com'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsService],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  test('should return true if the content is spam', () => {
    expect(service.isSpam('www.naver.com', spamLinkDomains, 1)).toBe(true);
  });
});
