import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export enum ExamMode {
  EXAM = 'EXAM',
  TRAINING = 'TRAINING',
}

export class AnswerDetailDto {
  @ApiProperty({ description: 'ID de la pregunta' })
  @IsInt()
  questionId: number;

  @ApiProperty({ description: 'Texto de la pregunta' })
  @IsString()
  questionText: string;

  @ApiProperty({ description: 'Respuesta del usuario', type: [String] })
  @IsArray()
  @IsString({ each: true })
  userAnswer: string[];

  @ApiProperty({ description: 'Respuesta correcta', type: [String] })
  @IsArray()
  @IsString({ each: true })
  correctAnswer: string[];

  @ApiProperty({ description: 'Si la respuesta es correcta' })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ description: 'Learning Objective de la pregunta' })
  @IsString()
  learningObjective: string;

  @ApiProperty({ description: 'Nivel K de la pregunta' })
  @IsString()
  kLevel: string;

  @ApiProperty({ description: 'Explicaciones de cada opción' })
  explanations: Record<string, any>;
}

export class LearningObjectiveResultDto {
  @ApiProperty({ description: 'Learning Objective' })
  @IsString()
  learningObjective: string;

  @ApiProperty({ description: 'Total de preguntas' })
  @IsInt()
  @Min(0)
  totalQuestions: number;

  @ApiProperty({ description: 'Respuestas correctas' })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({ description: 'Porcentaje de acierto' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

export class SubmitExamDto {
  @ApiProperty({ description: 'Nombre del participante', example: 'Juan Pérez' })
  @IsString()
  participantName: string;

  @ApiProperty({
    description: 'Email del participante (opcional)',
    example: 'juan@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  participantEmail?: string;

  @ApiProperty({ description: 'Fecha y hora de inicio del examen' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Fecha y hora de fin del examen' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Tiempo total empleado en segundos', example: 3600 })
  @IsInt()
  @Min(0)
  timeSpent: number;

  @ApiProperty({ description: 'Puntaje obtenido', example: 32 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Total de preguntas', example: 40 })
  @IsInt()
  @Min(1)
  totalQuestions: number;

  @ApiProperty({ description: 'Respuestas correctas', example: 32 })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({ description: 'Respuestas incorrectas', example: 8 })
  @IsInt()
  @Min(0)
  incorrectAnswers: number;

  @ApiProperty({ description: 'Porcentaje de acierto', example: 80.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ description: 'Si aprobó el examen' })
  @IsBoolean()
  passed: boolean;

  @ApiProperty({
    description: 'Modo del examen',
    enum: ExamMode,
    example: ExamMode.EXAM,
  })
  @IsEnum(ExamMode)
  mode: ExamMode;

  @ApiProperty({
    description: 'Detalle de todas las respuestas',
    type: [AnswerDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDetailDto)
  answers: AnswerDetailDto[];

  @ApiProperty({
    description: 'Análisis por Learning Objectives',
    type: [LearningObjectiveResultDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LearningObjectiveResultDto)
  learningObjectiveAnalysis: LearningObjectiveResultDto[];
}
