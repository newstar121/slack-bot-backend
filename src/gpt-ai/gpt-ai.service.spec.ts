import { Test, TestingModule } from '@nestjs/testing'
import { GptAiService } from './gpt-ai.service'

describe('GptAiService', () => {
  let service: GptAiService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GptAiService]
    }).compile()

    service = module.get<GptAiService>(GptAiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
