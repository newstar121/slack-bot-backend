import { Body, Controller, Get, Headers, Post, Req, UseFilters } from '@nestjs/common'
import { GPT_AI_CONSTANTS, GPT_AI_METHODS } from '../common/app.constants'
import { GptAiService } from './gpt-ai.service'
import { TableFunctionDto } from './dto/table-function.dto'
import {
  IGptAskRequest,
  IGptExtractRequest,
  IGptFillRequest,
  IGptFormatRequest,
  IGptListRequest,
  IGptTableRequest,
  IGptTranslateRequest,
  OpenAiBody
} from '../interfaces/gpt-ai.interfaces'
import { AxiosExceptionFilter } from '../filters/axios-exception.filter'
import { FormatFunctionDto } from './dto/format-function.dto'
import { ExtractFunctionDto } from './dto/extract-function.dto'
import { TranslateFunctionDto } from './dto/translate-function.dto'
import { AskFunctionDto } from './dto/ask-function.dto'
import { FillFunctionDto } from './dto/fill-function.dto'
import { ListFunctionDto } from './dto/list-function.dto'
import { Request } from 'express'

@Controller('ai')
export class GptAiController {
  constructor(private readonly gptAiService: GptAiService) {}

  @Get('ping')
  AIPing() {
    return 'OK ping'
  }

  // table function
  @Post([GPT_AI_METHODS.table, 'GPT_TABLE'])
  @UseFilters(AxiosExceptionFilter)
  async table(@Headers('x-api-key') apiKey: string, @Body() body: TableFunctionDto) {
    const user = await this.gptAiService.checkApiKeyPromptAndUser(apiKey, body.prompt, body.email)
    this.gptAiService.checkPremiumParameters(body, user)
    const gptAiRequest: IGptTableRequest = { ...body, apiKey }
    return this.gptAiService.getOpenAiResponseForTable(user, gptAiRequest)
  }

  // format function
  @Post([GPT_AI_METHODS.format, 'GPT_FORMAT'])
  @UseFilters(AxiosExceptionFilter)
  async format(
    @Headers('x-api-key') apiKey: string,
    @Body() body: FormatFunctionDto,
    @Req() req: Request
  ) {
    // TODO Following lines should be removed later
    const { prompt, value } = body
    if (typeof prompt === 'string' && typeof value === 'string') {
      const user = await this.gptAiService.checkUser(body.email)
      const openAiReqBody: OpenAiBody = {
        prompt: '',
        temperature: GPT_AI_CONSTANTS.defaultTemperature,
        max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
      }
      openAiReqBody.model = this.gptAiService.checkIfModelNull(null, body.modelVersion)
      openAiReqBody.prompt = `Convert provided text """${value}""" to a requested format """${prompt}""". Output must be only converted text.`
      const resStringData = await this.gptAiService.sendRequest(
        apiKey,
        user,
        openAiReqBody,
        body.modelVersion
      )
      const resArray = this.gptAiService.transformFromJSONLikeResponse(
        resStringData,
        true,
        GPT_AI_METHODS.format
      )
      return resArray[0][0]
    }
    // TODO Above lines should be removed later

    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.prompt.toString(),
      body.email
    )
    const gptAiRequest: IGptFormatRequest = { ...body, apiKey }
    return this.gptAiService.getOpenAiResponseForFormat(user, gptAiRequest)
  }

  // extract function
  @Post([GPT_AI_METHODS.extract, 'GPT_EXTRACT'])
  @UseFilters(AxiosExceptionFilter)
  async extract(
    @Headers('x-api-key') apiKey: string,
    @Body() body: ExtractFunctionDto,
    @Req() req: Request
  ) {
    // TODO Following lines should be removed later
    const { prompt, value } = body
    if (typeof prompt === 'string' && typeof value === 'string') {
      const user = await this.gptAiService.checkUser(body.email)
      const openAiReqBody: OpenAiBody = {
        prompt: '',
        temperature: GPT_AI_CONSTANTS.defaultTemperature,
        max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
      }
      openAiReqBody.model = this.gptAiService.checkIfModelNull(null, body.modelVersion)
      openAiReqBody.prompt = `Extract ${prompt} from the following data ${value}. Output must be only extracted text.`
      const resStringData = await this.gptAiService.sendRequest(
        apiKey,
        user,
        openAiReqBody,
        body.modelVersion
      )
      const resArray = this.gptAiService.transformFromJSONLikeResponse(
        resStringData,
        true,
        GPT_AI_METHODS.extract
      )
      return resArray[0][0]
    }
    // TODO Above lines should be removed later

    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.prompt.toString(),
      body.email
    )
    const gptAiRequest: IGptExtractRequest = { ...body, apiKey }
    return this.gptAiService.getOpenAiResponseForExtract(user, gptAiRequest)
  }

  // translate function
  @Post([GPT_AI_METHODS.translate, 'GPT_TRANSLATE'])
  @UseFilters(AxiosExceptionFilter)
  async translate(
    @Headers('x-api-key') apiKey: string,
    @Body() body: TranslateFunctionDto,
    @Req() req: Request
  ) {
    // TODO Following lines should be removed later
    const { prompt, value } = body
    if (typeof prompt === 'string' && typeof value === 'string') {
      const user = await this.gptAiService.checkUser(body.email)
      const openAiReqBody: OpenAiBody = {
        prompt: '',
        temperature: GPT_AI_CONSTANTS.defaultTemperature,
        max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
      }
      openAiReqBody.model = this.gptAiService.checkIfModelNull(null, body.modelVersion)
      openAiReqBody.prompt = `Translate "${String(value).replace(
        '"',
        "'"
      )}" into ${prompt}. Don't enclose translated text in quotation marks.`
      const resStringData = await this.gptAiService.sendRequest(
        apiKey,
        user,
        openAiReqBody,
        body.modelVersion
      )
      const resArray = this.gptAiService.transformFromJSONLikeResponse(
        resStringData,
        true,
        GPT_AI_METHODS.translate
      )
      return resArray[0][0]
    }
    // TODO Above lines should be removed later

    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.prompt.toString(),
      body.email
    )
    const gptAiRequest: IGptTranslateRequest = { ...body, apiKey }
    return this.gptAiService.getOpenAiResponseForTranslate(user, gptAiRequest)
  }

  // ask function
  @Post([GPT_AI_METHODS.ask, 'GPT_ASK'])
  @UseFilters(AxiosExceptionFilter)
  async ask(@Headers('x-api-key') apiKey: string, @Body() body: AskFunctionDto) {
    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.prompt.join(''),
      body.email
    )
    this.gptAiService.checkPremiumParameters(body, user)
    const gptAiRequest: IGptAskRequest = { ...body, max_tokens: body.maxTokens, apiKey }
    return this.gptAiService.getOpenAiResponseForAsk(user, gptAiRequest)
  }

  // fill function
  @Post([GPT_AI_METHODS.fill, 'GPT_FILL'])
  @UseFilters(AxiosExceptionFilter)
  async fill(@Headers('x-api-key') apiKey: string, @Body() body: FillFunctionDto) {
    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.partial.join(),
      body.email
    )
    this.gptAiService.checkPremiumParameters(body, user)
    const gptAiRequest: IGptFillRequest = { ...body, apiKey }
    return this.gptAiService.getOpenAiResponseForFill(user, gptAiRequest)
  }

  // list function
  @Post([GPT_AI_METHODS.list, 'GPT_LIST'])
  @UseFilters(AxiosExceptionFilter)
  async list(@Headers('x-api-key') apiKey: string, @Body() body: ListFunctionDto) {
    const user = await this.gptAiService.checkApiKeyPromptAndUser(
      apiKey,
      body.prompt.join(''),
      body.email
    )
    this.gptAiService.checkPremiumParameters(body, user)
    const gptAiRequest: IGptListRequest = { ...body, max_tokens: body.maxTokens, apiKey }
    return this.gptAiService.getOpenAiResponseForList(user, gptAiRequest)
  }
}
