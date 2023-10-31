import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import {
  AvailableModelsForVersions,
  AvailableModelVersions,
  IGptAskRequest,
  IGptExtractRequest,
  IGptFillRequest,
  IGptFormatRequest,
  IGptListRequest,
  IGPTRequestBody,
  IGptTableRequest,
  IGptTranslateRequest,
  OpenAiBody
} from '../interfaces/gpt-ai.interfaces'
import { UserEntity } from '../users/entities/user.entity'
import {
  COMMON_ERRORS,
  GPT_35_MODELS,
  GPT_3_MODELS,
  GPT_4_MODELS,
  GPT_AI_CONSTANTS,
  GPT_AI_METHODS,
  GPT_AVAILABLE_MODELS,
  UserStatuses
} from '../common/app.constants'
import {
  extractFuncGPTPrompt,
  fillFuncGPTPrompt,
  formatFuncGPTPrompt,
  listFuncGPTPrompt,
  transformAiResponseToTable,
  transformFillResponseToExcel,
  transformListResponseToExcel,
  translateFuncGPTPrompt
} from '../common/utils'
import { UsersService } from '../users/users.service'
import { TableFunctionDto } from './dto/table-function.dto'

@Injectable()
export class GptAiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly usersService: UsersService
  ) {}

  checkAPIKey(apiKey?: string) {
    if (!apiKey) throw new BadRequestException(COMMON_ERRORS.apiKeyNotFound)
  }

  checkPrompt(prompt: string) {
    if (prompt.trim() === '') throw new BadRequestException(COMMON_ERRORS.promptIsEmpty)
  }

  async checkUser(email: string) {
    let user: UserEntity | null = null
    if (email) user = await this.usersService.findUserByEmail(email)
    return user
  }

  async checkApiKeyPromptAndUser(apiKey: string, prompt: string, email: string) {
    this.checkAPIKey(apiKey)
    this.checkPrompt(prompt)
    return await this.checkUser(email)
  }

  checkPremiumParameters(
    data: Pick<TableFunctionDto, 'temperature' | 'model'>,
    user: UserEntity | null
  ) {
    const { temperature, model } = data
    if (temperature || model) {
      if (!user || user.status === UserStatuses.free)
        throw new ForbiddenException(COMMON_ERRORS.advancedParametersOnFree)
    }
  }

  checkIfModelNull(model: AvailableModelsForVersions | null, modelVersion: AvailableModelVersions) {
    if (model === null) {
      if (modelVersion === 'gpt3') return GPT_3_MODELS['text-davinci-003']
      if (modelVersion === 'gpt35') return GPT_35_MODELS['gpt-3.5-turbo']
      if (modelVersion === 'gpt4') return GPT_4_MODELS['gpt-4']
    }
    return model
  }

  checkIfUserOrModelPremium(user: UserEntity | null, modelVersion: AvailableModelVersions) {
    return (
      user &&
      user.status === UserStatuses.premium &&
      (modelVersion === 'gpt35' || modelVersion === 'gpt4')
    )
  }

  async sendChatRequest(body: IGPTRequestBody) {
    const postContent = {
      model: body.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: body.prompt
        }
      ],
      temperature: body.temperature
    }
    const response = await this.httpService.axiosRef.post(
      'https://api.openai.com/v1/chat/completions',
      postContent,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${body.apiKey}`
        }
      }
    )
    return response.data
  }

  async sendSimpleRequest(body: IGPTRequestBody) {
    const { apiKey, temperature, model, prompt, max_tokens } = body
    const aiReqBody = { model, temperature, prompt, max_tokens }
    const response = await this.httpService.axiosRef.post(
      'https://api.openai.com/v1/completions',
      aiReqBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    )
    return response.data
  }

  async sendRequest(
    apiKey: string,
    user: UserEntity | null,
    openAiReqBody: OpenAiBody,
    modelVersion: AvailableModelVersions
  ) {
    if (this.checkIfUserOrModelPremium(user, modelVersion)) {
      const data = await this.sendChatRequest({ ...openAiReqBody, apiKey })
      return data.choices[0].message.content.trim()
    }
    // if free subscription used
    // if user tries to send free request with gpt3 model use gpt models as default
    if (modelVersion !== GPT_AVAILABLE_MODELS[GPT_AVAILABLE_MODELS.gpt3])
      openAiReqBody.model = GPT_3_MODELS['text-davinci-003']
    const data = await this.sendSimpleRequest({ ...openAiReqBody, apiKey })
    return data.choices[0].text.trim()
  }

  transformFromJSONLikeResponse(
    resStringData: string,
    onlyOneRow = false,
    func: GPT_AI_METHODS,
    reqLength = undefined
  ) {
    if (onlyOneRow) return [[resStringData]]
    try {
      let formattedData = `[${resStringData}]`
      const syntaxRegex = /(",])|("\.])$/
      if (func == GPT_AI_METHODS.translate && syntaxRegex.test(formattedData))
        formattedData = formattedData.replace(syntaxRegex, '"]')
      let separatedValues: string[] = JSON.parse(formattedData)
      if (separatedValues.length > reqLength) separatedValues.pop()
      return separatedValues.map(v => [v])
    } catch (e: unknown) {
      console.error(`ERROR: ${func} => ${e}`)
      throw new BadRequestException(COMMON_ERRORS.unExpectedError)
    }
  }

  async getOpenAiResponseForTable(user: UserEntity | null, request: IGptTableRequest) {
    const { prompt, temperature, model, modelVersion, apiKey, max_tokens, header } = request
    const openAiReqBody: OpenAiBody = {
      prompt,
      temperature: temperature || GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number,
      model
    }
    openAiReqBody.prompt = `${prompt} in table format only`
    const headerString = header ? header.join(' ') : ''
    if (header) openAiReqBody.prompt = `${openAiReqBody.prompt} with headers ${headerString}`
    openAiReqBody.model = this.checkIfModelNull(model, modelVersion)
    const resStringData = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return transformAiResponseToTable(resStringData, headerString)
  }

  async getOpenAiResponseForFormat(user: UserEntity | null, request: IGptFormatRequest) {
    const { prompt, modelVersion, value, apiKey } = request
    const openAiReqBody: OpenAiBody = {
      prompt: prompt.toString(),
      temperature: GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
    }
    const onlyOneRow = prompt.length === 1 && value.length === 1
    openAiReqBody.model = this.checkIfModelNull(null, modelVersion)
    openAiReqBody.prompt = formatFuncGPTPrompt(value, prompt)
    // If only one row format requested
    if (onlyOneRow) {
      const promptText = value[0][0]
      const requestedFormat = prompt[0][0]
      openAiReqBody.prompt = `Convert provided text """${promptText}""" to a requested format """${requestedFormat}""". Output must be only converted text.`
    }
    const resStringData: string = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return this.transformFromJSONLikeResponse(resStringData, onlyOneRow, GPT_AI_METHODS.format)
  }

  async getOpenAiResponseForExtract(user: UserEntity | null, request: IGptExtractRequest) {
    const { prompt, modelVersion, value, apiKey } = request
    const openAiReqBody: OpenAiBody = {
      prompt: prompt.toString(),
      temperature: GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
    }
    const onlyOneRow = prompt.length === 1 && value.length === 1
    openAiReqBody.model = this.checkIfModelNull(null, modelVersion)
    openAiReqBody.prompt = extractFuncGPTPrompt(value, prompt)
    // If only one row format requested
    if (onlyOneRow) {
      const promptText = value[0][0]
      const requestedExtract = prompt[0][0]
      openAiReqBody.prompt = `Extract ${requestedExtract} from the following data ${promptText}. Output must be only extracted text.`
    }
    const resStringData = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return this.transformFromJSONLikeResponse(resStringData, onlyOneRow, GPT_AI_METHODS.extract)
  }

  async getOpenAiResponseForTranslate(user: UserEntity | null, request: IGptTranslateRequest) {
    const { prompt, modelVersion, value, apiKey } = request
    const openAiReqBody: OpenAiBody = {
      prompt: prompt.toString(),
      temperature: GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
    }
    const onlyOneRow = prompt.length === 1 && value.length === 1
    openAiReqBody.model = this.checkIfModelNull(null, modelVersion)
    openAiReqBody.prompt = translateFuncGPTPrompt(value, prompt)
    // If only one row format requested
    if (onlyOneRow) {
      const promptText = value[0][0]
      const requestedLanguage = prompt[0][0]
      openAiReqBody.prompt = `Translate "${promptText.replace(
        '"',
        "'"
      )}" into ${requestedLanguage}. Don't enclose translated text in quotation marks.`
    }
    const resStringData = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return this.transformFromJSONLikeResponse(
      resStringData,
      onlyOneRow,
      GPT_AI_METHODS.translate,
      value.length
    )
  }

  async getOpenAiResponseForAsk(user: UserEntity | null, request: IGptAskRequest) {
    const { prompt, temperature, model, modelVersion, apiKey, max_tokens, value } = request
    const openAiReqBody: OpenAiBody = {
      prompt: prompt.join(''),
      temperature: temperature || GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: max_tokens || (GPT_AI_CONSTANTS.defaultMaxTokens as number),
      model
    }
    if (value) openAiReqBody.prompt = `${openAiReqBody.prompt} ${value.join('')}`
    openAiReqBody.model = this.checkIfModelNull(model, modelVersion)
    return this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
  }

  async getOpenAiResponseForFill(user: UserEntity | null, request: IGptFillRequest) {
    const { partial, temperature, modelVersion, apiKey, example } = request
    const openAiReqBody: OpenAiBody = {
      prompt: partial.join(''),
      temperature: temperature || GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: GPT_AI_CONSTANTS.defaultMaxTokens as number
    }
    openAiReqBody.model = this.checkIfModelNull(null, modelVersion)
    openAiReqBody.prompt = fillFuncGPTPrompt(partial, example)
    const resStringData = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return transformFillResponseToExcel(resStringData)
  }

  async getOpenAiResponseForList(user: UserEntity | null, request: IGptListRequest) {
    const { prompt, temperature, model, modelVersion, apiKey, max_tokens, value } = request
    const openAiReqBody: OpenAiBody = {
      prompt: prompt.join(' '),
      temperature: temperature || GPT_AI_CONSTANTS.defaultTemperature,
      max_tokens: max_tokens || (GPT_AI_CONSTANTS.defaultMaxTokens as number),
      model
    }
    openAiReqBody.prompt = listFuncGPTPrompt(prompt, value)
    openAiReqBody.model = this.checkIfModelNull(model, modelVersion)
    const resStringData = await this.sendRequest(apiKey, user, openAiReqBody, modelVersion)
    return transformListResponseToExcel(resStringData)
  }

  async generateSlides(apiKey: string, prompt: string, numberofslides: string) {
    try {
      const promptText = `
    Create content for a PowerPoint presentation with  <number>${numberofslides}</number> slides on the topic  <topic>${prompt}</topic>. Suggest an image for each slide. Start with Slide 1 which has only presentation title. Return other slides content as a json list of dictionaries, where each dict has the following keys: 'slide' - slide number, 'title' - a slide title, 'subtitle' - a slide subtitle or slogan, 'image_description' - provide a few keywords in array to search for that image, 'content' - an array of items to talk about on this slide.
    Must follow this structure:
    [
        {
            "slide": 1,
            "title": "Humans",
            "subtitle": "The Most Fascinating Species on Earth",
            "image_description": [
                "human silhouette",
                "sunset"
            ],
            "content": []
        }
    ]
    `

      const postContent = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        temperature: 1,
        max_tokens: 3000
      }

      const response = await this.httpService.axiosRef.post(
        'https://api.openai.com/v1/chat/completions',
        postContent,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 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'
          }
        }
      )
      console.log(`SlidesLog:${numberofslides}|${prompt}`)

      console.log('Response:', response.data.choices[0].message.content.trim())

      return JSON.parse(response.data.choices[0].message.content.trim())
    } catch (error) {
      //return other errors
      console.error('Generate Slides Error: ', error)
      throw error
    }
  }
}
