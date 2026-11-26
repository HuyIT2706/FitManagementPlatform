import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class LogActivityDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên hoạt động' })
  @MaxLength(120)
  activityName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Năng lượng tiêu hao phải lớn hơn 0 kcal' })
  @Max(10000, { message: 'Năng lượng tiêu hao tối đa 10.000 kcal' })
  caloriesBurned!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  intensity?: string;

  @IsOptional()
  @IsString()
  logDate?: string;
}
