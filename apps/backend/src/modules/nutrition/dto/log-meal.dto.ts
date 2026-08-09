import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class MealItemDto {
  @IsString()
  foodId!: string;

  @IsNumber()
  weightInGram!: number;
}

export class LogMealDto {
  @IsString()
  mealName!: string;

  @IsOptional()
  @IsDateString()
  logDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items!: MealItemDto[];
}
