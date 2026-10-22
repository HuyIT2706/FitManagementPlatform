import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class GenerateMealPlanDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  targetProtein?: number;

  @IsOptional()
  @IsNumber()
  targetCarbs?: number;

  @IsOptional()
  @IsNumber()
  targetFat?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConditions?: string[];

  @IsOptional()
  @IsNumber()
  mealFrequency?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedMeals?: (
    | 'breakfast'
    | 'morningSnack'
    | 'lunch'
    | 'afternoonSnack'
    | 'dinner'
    | 'snack'
  )[];

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  saveToDatabase?: boolean;
}
