import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { AvailableModelsForVersions, AvailableModelVersions } from '../interfaces/gpt-ai.interfaces'
import { TableFunctionDto } from './dto/table-function.dto'
import { BadRequestException } from '@nestjs/common'
import { COMMON_ERRORS, GPT_35_MODELS, GPT_3_MODELS, GPT_4_MODELS } from '../common/app.constants'

@ValidatorConstraint({})
export class IsValidModelForVersion implements ValidatorConstraintInterface {
  constructor() {}

  checkModelExists(modelVersion: AvailableModelVersions, model: AvailableModelsForVersions) {
    let gptModels = Object.values(GPT_3_MODELS) as string[]
    if (modelVersion === 'gpt35') gptModels = Object.values(GPT_35_MODELS) as string[]
    if (modelVersion === 'gpt4') gptModels = Object.values(GPT_4_MODELS) as string[]
    const formatted = gptModels.join(', ')
    if (!gptModels.includes(model))
      throw new BadRequestException(
        `Invalid model for "${modelVersion}". Model should be one of: ${formatted}`
      )
  }

  validate(value: AvailableModelsForVersions, validationArguments: any) {
    const { modelVersion }: TableFunctionDto = validationArguments.object
    if (!['gpt3', 'gpt35', 'gpt4'].includes(modelVersion))
      throw new BadRequestException(COMMON_ERRORS.badModelVersionError)
    this.checkModelExists(modelVersion, value)
    return true
  }
}

export function ValidForModel(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidModelForVersion
    })
  }
}
