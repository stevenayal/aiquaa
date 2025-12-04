import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JavelinService } from './javelin.service';
import { CreateJavelinFeedbackDto } from './create-javelin-feedback.dto';

@ApiTags('Javelin')
@Controller('javelin')
export class JavelinController {
  constructor(private readonly javelinService: JavelinService) {}

  @Post('feedback')
  @ApiOperation({ summary: 'Submit Javelin feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async submitFeedback(@Body() createJavelinFeedbackDto: CreateJavelinFeedbackDto) {
    return this.javelinService.submitFeedback(createJavelinFeedbackDto);
  }
}
