import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('forum')
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.forumService.getCategories();
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get threads with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Category ID filter' })
  @ApiResponse({ status: 200, description: 'List of threads with pagination metadata' })
  async getThreads(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: number,
  ) {
    return this.forumService.getThreads({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  }

  @Get('threads/:id')
  @ApiOperation({ summary: 'Get thread by ID' })
  @ApiResponse({ status: 200, description: 'Thread details' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async getThread(@Param('id') id: string) {
    return this.forumService.getThread(Number(id));
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createThread(@Body() createThreadDto: any, @Request() req: any) {
    const threadData = {
      ...createThreadDto,
      authorId: req.user.id,
    };
    return this.forumService.createThread(threadData);
  }

  @Get('threads/:id/posts')
  @ApiOperation({ summary: 'Get posts for a thread with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of posts with pagination metadata' })
  async getPosts(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.forumService.getPosts({
      threadId: Number(id),
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('threads/:id/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post in a thread' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(
    @Param('id') id: string,
    @Body() createPostDto: any,
    @Request() req: any,
  ) {
    const postData = {
      ...createPostDto,
      threadId: Number(id),
      authorId: req.user.id,
    };
    return this.forumService.createPost(postData);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search threads' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Search results with pagination metadata' })
  async searchThreads(
    @Query('q') searchTerm: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.forumService.searchThreads(
      searchTerm,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }
}
