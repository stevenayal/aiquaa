import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateThreadDto, CreatePostDto } from './dto';

@ApiTags('Forum')
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener todas las categorías',
    description: 'Retorna la lista completa de categorías disponibles en el foro'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'General' },
          description: { type: 'string', example: 'Discusiones generales' },
          slug: { type: 'string', example: 'general' },
          threadCount: { type: 'number', example: 25 }
        }
      }
    }
  })
  async getCategories() {
    return this.forumService.getCategories();
  }

  @Get('tags')
  @ApiOperation({
    summary: 'Obtener todas las etiquetas',
    description: 'Retorna la lista completa de tags disponibles para clasificar threads'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tags obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'javascript' },
          color: { type: 'string', example: '#3B82F6' },
          usageCount: { type: 'number', example: 15 }
        }
      }
    }
  })
  async getTags() {
    return this.forumService.getTags();
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get threads with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category name filter' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Tags filter (comma separated)' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Author name filter' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest', 'mostViewed', 'mostReplied'], description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'List of threads with pagination metadata' })
  async getThreads(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('author') author?: string,
    @Query('sortBy') sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied',
  ) {
    const parsedTags = tags ? tags.split(',').map(t => t.trim()) : undefined;

    return this.forumService.getThreads({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
      tags: parsedTags,
      author,
      sortBy,
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
  async createThread(@Body() createThreadDto: CreateThreadDto, @Request() req: any) {
    const threadData = {
      ...createThreadDto,
      authorId: req.user.id,
    };
    return this.forumService.createThread(threadData);
  }

  @Put('threads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a thread' })
  @ApiResponse({ status: 200, description: 'Thread updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async updateThread(
    @Param('id') id: string,
    @Body() updateThreadDto: Partial<CreateThreadDto>,
    @Request() req: any,
  ) {
    return this.forumService.updateThread(Number(id), updateThreadDto, req.user.id);
  }

  @Delete('threads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiResponse({ status: 200, description: 'Thread deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async deleteThread(@Param('id') id: string, @Request() req: any) {
    return this.forumService.deleteThread(Number(id), req.user.id);
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
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ) {
    const postData = {
      ...createPostDto,
      threadId: Number(id),
      authorId: req.user.id,
    };
    return this.forumService.createPost(postData);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get forum statistics' })
  @ApiResponse({ status: 200, description: 'Forum statistics' })
  async getForumStats() {
    return this.forumService.getForumStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search threads' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category filter' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Tags filter (comma separated)' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Author filter' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest', 'mostViewed', 'mostReplied'], description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'Search results with pagination metadata' })
  async searchThreads(
    @Query('q') searchTerm: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('author') author?: string,
    @Query('sortBy') sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied',
  ) {
    const parsedTags = tags ? tags.split(',').map(t => t.trim()) : undefined;

    return this.forumService.search(
      searchTerm,
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        category,
        tags: parsedTags,
        author,
        sortBy,
      }
    );
  }
}
