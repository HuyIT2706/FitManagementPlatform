import { IsString, IsNotEmpty } from 'class-validator';

export class SmartParseFoodDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class SmartParseFoodImageDto {
  @IsString()
  @IsNotEmpty()
  imageBase64!: string;
}
