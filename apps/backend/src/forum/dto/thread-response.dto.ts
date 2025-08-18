import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatarUrl?: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  slug: string;
}

export class ThreadResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  isSticky: boolean;

  @ApiProperty()
  isLocked: boolean;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  author: UserResponseDto;

  @ApiProperty()
  category: CategoryResponseDto;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  replyCount: number;
}

export class ThreadListResponseDto {
  @ApiProperty({ type: [ThreadResponseDto] })
  data: ThreadResponseDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
