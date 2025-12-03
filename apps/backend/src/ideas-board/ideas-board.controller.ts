import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdeasBoardService } from './ideas-board.service';
import {
  CreateIdeaDto,
  UpdateIdeaDto,
  VoteIdeaDto,
  CreateCommentDto,
  UpdateStatusDto,
} from './dto';
import { IdeaStatus } from '@prisma/client';

@ApiTags('Ideas Board')
@Controller('api/v1/ideas-board')
export class IdeasBoardController {
  constructor(private readonly ideasBoardService: IdeasBoardService) {}

  // ============================================================
  // CATEGORÍAS
  // ============================================================

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener categorías de ideas',
    description: 'Lista todas las categorías disponibles para clasificar ideas',
  })
  @ApiResponse({ status: 200, description: 'Categorías obtenidas exitosamente' })
  async getCategories() {
    return this.ideasBoardService.getCategories();
  }

  // ============================================================
  // CRUD DE IDEAS
  // ============================================================

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de ideas',
    description: 'Lista ideas con filtros y paginación',
  })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: IdeaStatus,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'authorId', required: false, type: Number })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['newest', 'oldest', 'topVoted', 'trending'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Ideas obtenidas exitosamente' })
  async getIdeas(@Query() query: any, @Request() req: any) {
    const userId = req.user?.userId;
    return this.ideasBoardService.getIdeas(query, userId);
  }

  @Get('top')
  @ApiOperation({
    summary: 'Obtener top ideas',
    description: 'Lista las ideas más votadas',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Top ideas obtenidas exitosamente' })
  async getTopIdeas(@Query('limit') limit: number, @Request() req: any) {
    const userId = req.user?.userId;
    return this.ideasBoardService.getTopIdeas(limit || 10, userId);
  }

  @Get('my-votes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener ideas votadas por el usuario',
    description: 'Lista las ideas que el usuario ha votado',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Ideas votadas obtenidas exitosamente' })
  async getUserVotedIdeas(@Request() req: any, @Query() query: any) {
    const { page, limit } = query;
    return this.ideasBoardService.getUserVotedIdeas(
      req.user.userId,
      page || 1,
      limit || 20,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una idea',
    description: 'Obtiene los detalles completos de una idea incluyendo comentarios',
  })
  @ApiResponse({ status: 200, description: 'Idea obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async getIdea(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.userId;
    return this.ideasBoardService.getIdea(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva idea',
    description: 'Permite a usuarios autenticados proponer nuevas ideas',
  })
  @ApiResponse({ status: 201, description: 'Idea creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @HttpCode(HttpStatus.CREATED)
  async createIdea(@Body() createIdeaDto: CreateIdeaDto, @Request() req: any) {
    return this.ideasBoardService.createIdea(createIdeaDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una idea',
    description: 'Permite al autor o admin actualizar una idea',
  })
  @ApiResponse({ status: 200, description: 'Idea actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar esta idea' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async updateIdea(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIdeaDto: UpdateIdeaDto,
    @Request() req: any,
  ) {
    return this.ideasBoardService.updateIdea(
      id,
      updateIdeaDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una idea',
    description: 'Permite al autor o admin eliminar una idea',
  })
  @ApiResponse({ status: 200, description: 'Idea eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta idea' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async deleteIdea(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ideasBoardService.deleteIdea(id, req.user.userId, req.user.role);
  }

  // ============================================================
  // VOTACIÓN
  // ============================================================

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Votar por una idea',
    description: 'Permite upvote (+1) o downvote (-1) en una idea',
  })
  @ApiResponse({ status: 200, description: 'Voto registrado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async voteIdea(
    @Param('id', ParseIntPipe) id: number,
    @Body() voteDto: VoteIdeaDto,
    @Request() req: any,
  ) {
    return this.ideasBoardService.voteIdea(id, req.user.userId, voteDto);
  }

  @Delete(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Quitar voto de una idea',
    description: 'Elimina el voto del usuario en una idea',
  })
  @ApiResponse({ status: 200, description: 'Voto removido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'No has votado por esta idea' })
  async removeVote(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ideasBoardService.removeVote(id, req.user.userId);
  }

  // ============================================================
  // COMENTARIOS
  // ============================================================

  @Get(':id/comments')
  @ApiOperation({
    summary: 'Obtener comentarios de una idea',
    description: 'Lista los comentarios de una idea específica',
  })
  @ApiResponse({ status: 200, description: 'Comentarios obtenidos exitosamente' })
  async getComments(@Param('id', ParseIntPipe) id: number) {
    const idea = await this.ideasBoardService.getIdea(id);
    return idea.comments;
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Agregar comentario a una idea',
    description: 'Permite a usuarios autenticados comentar en una idea',
  })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.ideasBoardService.addComment(id, req.user.userId, createCommentDto);
  }

  // ============================================================
  // ADMINISTRACIÓN (SOLO ADMINS)
  // ============================================================

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar estado de una idea (solo admins)',
    description:
      'Permite a administradores cambiar el estado de una idea (PENDING, APPROVED, IN_PROGRESS, COMPLETED, REJECTED)',
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo admins pueden cambiar el estado' })
  @ApiResponse({ status: 404, description: 'Idea no encontrada' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.ideasBoardService.updateStatus(
      id,
      updateStatusDto,
      req.user.userId,
      req.user.role,
    );
  }
}
