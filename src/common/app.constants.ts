export enum EnvVariables {
  port = 'PORT',
  frontAppVersion = 'FRONT_APP_VERSION',
  stripeKey = 'STRIPE_KEY',
  stripeWebhookSecret = 'STRIPE_WEBHOOK_SECRET',
  dbHost = 'DB_HOST',
  dbUserPassword = 'DB_PASSWORD',
  dbUserName = 'DB_USER_NAME',
  dbName = 'DB_NAME',
  dbPort = 'DB_PORT',
  geo2IP2AccountId = 'GEO2IP2_ACCOUNT_ID',
  geo2IP2LicenceKey = 'GEO2IP2_LICENCE_KEY'
}

export enum GPT_AI_METHODS {
  table = 'table',
  format = 'format',
  extract = 'extract',
  translate = 'translate',
  ask = 'ask',
  fill = 'fill',
  list = 'list'
}

export enum GPT_AVAILABLE_MODELS {
  gpt3,
  gpt35,
  gpt4
}

export enum GPT_3_MODELS {
  'text-davinci-003' = 'text-davinci-003',
  'text-davinci-002' = 'text-davinci-002',
  'text-davinci-001' = 'text-davinci-001',
  'text-curie-001' = 'text-curie-001',
  'text-babbage-001' = 'text-babbage-001',
  'text-ada-001' = 'text-ada-001',
  'davinci' = 'davinci',
  'curie' = 'curie',
  'babbage' = 'babbage',
  'ada' = 'ada'
}

export enum GPT_35_MODELS {
  'gpt-3.5-turbo' = 'gpt-3.5-turbo',
  'gpt-3.5-turbo-0613' = 'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k' = 'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-16k-0613' = 'gpt-3.5-turbo-16k-0613'
}

export enum GPT_4_MODELS {
  'gpt-4' = 'gpt-4',
  'gpt-4-0613' = 'gpt-4-0613',
  'gpt-4-32k' = 'gpt-4-32k',
  'gpt-4-32k-0613' = 'gpt-4-32k-0613'
}

export enum GPT_AI_CONSTANTS {
  defaultTemperature = 0,
  defaultMaxTokens = 2000
}

export enum COMMON_ERRORS {
  apiKeyNotFound = 'API key not found! Please add your OPEN AI API key.',
  promptIsEmpty = 'Prompt is empty!',
  unExpectedError = 'Unexpected error happened please try later!',
  temperatureError = 'Provided temperature must be between 0 and 2!',
  maxTokensError = 'Provided maxTokens must be greater than 0!',
  badModelVersionError = 'Invalid model version provided. Must be one of: gpt3, gpt35 or gpt4',
  advancedParametersOnFree = 'Advanced parameters are not available on a free plan.'
}

export enum UserStatuses {
  free = 'free',
  premium = 'premium'
}

export const APP_VERSION_HEADER = 'app-version'
