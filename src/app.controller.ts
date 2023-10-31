import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AppService } from './app.service'
import { GptAiService } from './gpt-ai/gpt-ai.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly gptAiService: GptAiService
  ) {}

  @Get()
  allOk(): string {
    return this.appService.allOk()
  }

  @Get('pexels')
  async pexels(@Query() params: any) {
    return this.appService.getImagesFromPexels(params.keyword, params.orientation)
  }

  @Post('generateSlides')
  async generateSlides(@Body() body: any) {
    return this.gptAiService.generateSlides(body.apiKey, body.prompt, body.numberofslides)
  }
}
