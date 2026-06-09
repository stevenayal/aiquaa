import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriorityDto } from './save-test-cases.dto';

export class BugReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stepsToReproduce!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  actualResult!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expectedResult!: string;

  @ApiProperty({ enum: PriorityDto })
  @IsEnum(PriorityDto)
  severity!: PriorityDto;

  @ApiProperty({ enum: PriorityDto })
  @IsEnum(PriorityDto)
  priority!: PriorityDto;

  @ApiProperty({ example: 'POST /transfers' })
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;
}

export class SaveBugReportsDto {
  @ApiProperty({ type: [BugReportDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BugReportDto)
  bugReports!: BugReportDto[];
}
