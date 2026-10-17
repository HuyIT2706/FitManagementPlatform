import { IsString, IsNotEmpty } from 'class-validator';

export class SmartParseFoodDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}
