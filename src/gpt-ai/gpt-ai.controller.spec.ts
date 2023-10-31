import { Test, TestingModule } from '@nestjs/testing'
import { GptAiController } from './gpt-ai.controller'

describe('GptAiController', () => {
  let controller: GptAiController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptAiController]
    }).compile()

    controller = module.get<GptAiController>(GptAiController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
