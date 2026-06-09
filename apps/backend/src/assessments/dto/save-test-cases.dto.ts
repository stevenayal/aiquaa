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

export enum TestCaseTypeDto {
  positive = 'positive',
  negative = 'negative',
  boundary = 'boundary',
  security = 'security',
  contract = 'contract',
}

export enum PriorityDto {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export class TestCaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preconditions?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  steps!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expectedResult!: string;

  @ApiProperty({ enum: TestCaseTypeDto })
  @IsEnum(TestCaseTypeDto)
  type!: TestCaseTypeDto;

  @ApiProperty({ enum: PriorityDto })
  @IsEnum(PriorityDto)
  priority!: PriorityDto;
}

export class SaveTestCasesDto {
  @ApiProperty({ type: [TestCaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases!: TestCaseDto[];
}
