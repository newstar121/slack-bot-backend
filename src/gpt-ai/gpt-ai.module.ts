import { Module } from '@nestjs/common'
import { GptAiService } from './gpt-ai.service'
import { GptAiController } from './gpt-ai.controller'
import { HttpModule } from '@nestjs/axios'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [HttpModule, UsersModule],
  providers: [GptAiService],
  controllers: [GptAiController],
  exports: [GptAiService]
})
export class GptAiModule {}
