import { ArrayNotEmpty, IsNumber, IsString } from 'class-validator';

export default class VerifyCardDto {
  @IsString()
  content: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  spamLinkDomains: string[];

  @IsNumber()
  redirectionDepth: number;
}
