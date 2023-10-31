import {
  GPT_35_MODELS,
  GPT_3_MODELS,
  GPT_4_MODELS,
  GPT_AVAILABLE_MODELS
} from '../common/app.constants'

export interface IGptAiRequest {
  prompt: string
  apiKey: string
  temperature?: number
  max_tokens?: number
  model?: AvailableModelsForVersions
  modelVersion?: AvailableModelVersions
}

export interface IGptTableRequest extends IGptAiRequest {
  header?: string[]
}

export interface IGptFormatRequest extends Omit<IGptAiRequest, 'prompt'> {
  value: string[][]
  prompt: string[][]
}

export interface IGptExtractRequest extends Omit<IGptAiRequest, 'prompt'> {
  value: string[][]
  prompt: string[][]
}

export interface IGptTranslateRequest extends Omit<IGptAiRequest, 'prompt'> {
  value: string[][]
  prompt: string[][]
}

export interface IGptAskRequest extends Omit<IGptAiRequest, 'prompt'> {
  prompt: string[][]
  value?: string[][]
}

export interface IGptFillRequest extends Omit<IGptAiRequest, 'prompt' | 'max_tokens' | 'model'> {
  example: string[][]
  partial: string[][]
}

export interface IGptListRequest extends Omit<IGptAiRequest, 'prompt'> {
  prompt: string[][]
  value?: string[][]
}

export type OpenAiBody = Pick<IGptAiRequest, 'model' | 'max_tokens' | 'temperature' | 'prompt'>

export type AvailableModelsForVersions =
  | keyof typeof GPT_3_MODELS
  | keyof typeof GPT_35_MODELS
  | keyof typeof GPT_4_MODELS

export type AvailableModelVersions = keyof typeof GPT_AVAILABLE_MODELS

export type IGPTRequestBody = OpenAiBody & { apiKey: string }
