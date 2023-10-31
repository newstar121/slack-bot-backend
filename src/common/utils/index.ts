import { config } from 'dotenv'

export const envFilePath = `${process.cwd()}/.${process.env.NODE_ENV || 'production'}.env`

config({ path: envFilePath })

export function extractFuncGPTPrompt(prompt: string[][], extract: string[][]) {
  let newExtract = ''
  if (extract.length === 1) newExtract = extract.toString()
  return prompt
    .map(
      (p, i) =>
        `
        Extract ${extract[i] || newExtract} from ${p}. Return only extracted value.
        If not found return Not found.`
    )
    .join('\n').concat(`
Give me each extracted value inside double quotation marks separated by comma.`)
}

export function formatFuncGPTPrompt(prompt: string[][], format: string[][]) {
  let newFormat = ''
  if (format.length === 1) newFormat = format.toString()
  return prompt
    .map(
      (p, i) =>
        `Convert provided text """${p}""" to a requested format """${
          format[i] || newFormat
        }""". Return only converted value.`
    )
    .join('\n').concat(`
Give me each converted values inside double quotation marks separated by comma.`)
}

export function translateFuncGPTPrompt(prompt: string[][], language: string[][]) {
  let newLanguage = ''
  if (language.length === 1) newLanguage = language.toString()
  return prompt
    .map(
      (p, i) =>
        `Translate ${p.toString().replace('"', "'")} into "${(language[i] || newLanguage)
          .toString()
          .replace('"', "'")}". Return only translated value and nothing else.`
    )
    .join('\n').concat(`
Give each translated value inside double quotation marks and separated by comma.
Result should be only translated values separated by comma.`)
}

export function fillFuncGPTPrompt(partial: string[][], example: string[][]) {
  const neu = example
  for (const s in partial) {
    neu.push([partial[s][0], ''])
  }

  const gpted = neu.map(r => `| ${r.join(' | ')} |`).join('\r\n')

  return `Fill the incomplete lines in this table and return the filled lines only without header:
    ${gpted}`
}

export function listFuncGPTPrompt(prompt: string[][], value: string[][]) {
  let question = ''
  try {
    if (prompt) {
      if (prompt && prompt.length >= 0) {
        for (const row in prompt) {
          question = `${question}\r\n${prompt[row].join(' | ')}`
        }
      }
    }
  } catch (error) {
    console.log('Unable to parse value: ', error)
  }

  try {
    if (value) {
      if (value && value.length >= 0) {
        for (const row in value) {
          question = `${question}\r\n${value[row].join(' | ')}`
        }
      }
    }
  } catch (error) {
    console.log('Unable to parse value: ', error)
  }

  return `
  Your task is to follow the request below, delimited by triple quotes. 
  Perform the following actions:
    1. Generate a list for the topic and follow the instruction.
    2. Output the list as single-level JSON array.
    3. Output should only contain JSON code
    
    request: """${question}"""`
}

function formatTableResponse(aiResponse: string) {
  return aiResponse.split(/\r?\n|\r|\n/g)
}

export function transformFillResponseToExcel(result: string) {
  const rows = formatTableResponse(result)
  let returnMatrix = []

  for (const rowIndex in rows) {
    const line = rows[rowIndex]

    const lineParts = line
      .split('|')
      .filter(cell => cell.replace(/[-&\/\\#,+()$~%.'":*?<>{}]/g, '').trim()) // split and remove duplicates

    if (lineParts.length == 1) {
      returnMatrix.push([lineParts[0].trim()])
    }

    if (lineParts.length > 1) {
      returnMatrix.push(lineParts.slice(1).map(linePart => linePart.trim()))
    }
  }

  return returnMatrix
}

export function transformAiResponseToTable(aiResponse: string, header?: string) {
  let formattedResponse = formatTableResponse(aiResponse)
  formattedResponse = formattedResponse.reduce((acc, val) => {
    if (val) {
      let row = val
        .split('|')
        .map(value => {
          if (value) return value
        })
        .filter(Boolean)
        .filter(val => !val.includes('--'))
      if (row.length >= 2) {
        acc.push(row.filter(Boolean))
      }
    }
    return acc
  }, [])

  if (header) formattedResponse.shift()
  return formattedResponse
}
export function transformAiResponseForFormat(
  aiResponse: string,
  onlyOneRow = false,
  reqLength = undefined
) {
  let formattedResponse = formatTableResponse(aiResponse)
  if (onlyOneRow) return [[formattedResponse.join(' ').toString()]]
  formattedResponse = formattedResponse.reduce((acc, val) => {
    if (val) {
      let row = val.split('|').filter(Boolean)
      if (!row[0].startsWith('---')) acc.push([row.toString()])
    }
    return acc
  }, [])
  if (reqLength && formattedResponse.length > reqLength) {
    formattedResponse = formattedResponse.slice(0, reqLength)
  }
  return formattedResponse
}

export function transformListResponseToExcel(result: string) {
  try {
    const originalArray = JSON.parse(result)

    return originalArray.map(item => [item])
  } catch (error) {
    throw 'Unable to generate response. Try to adjust your prompt or parameters.'
  }
}

export function getParityGroupByCountry(Code) {
  for (let i = 0; i < parityGroups.length; i++) {
    if (parityGroups[i].countryCode.includes(Code)) {
      return parityGroups[i]
    }
  }
  return parityGroups[0]
}

export function getParityGroupByGroupId(groupId) {
  const group = parityGroups.find(parityGroup => parityGroup.group === groupId)
  return group ? group : parityGroups[0] // return group 0 if not found
}

const parityGroups = [
  {
    group: 0, //default group
    countryCode: [''],
    //    country: [''],
    discount: null,
    code: null,
    price: '8.99',
    mode: 'subscription',
    priceId: process.env.SUBSCRIPTION_PRICE_ID
  },
  {
    group: 1,
    countryCode: ['PK', 'IN', 'TR', 'EG', 'AR', 'BD'],
    //   country: ['Pakistan', 'India', 'Turkey', 'Egypt', 'Argentina', 'Bangladesh'],
    //    discount: '70%',
    //   code: "70OFF20",
    price: '2.99',
    mode: 'subscription',
    priceId: process.env.SUBSCRIPTION_PRICE_ID_GROUP1
  },
  {
    group: 2,
    countryCode: ['NG', 'VN', 'GH', 'KE', 'ZA', 'MY', 'IQ', 'ID', 'CN'],
    //   country: ['Nigeria', 'Vietnam', 'Ghana', 'Kenya', 'South Africa', 'Malaysia', 'Iraq', 'Indonesia', 'China'],
    //  discount: '50%',
    //  code: "50SAVE50",
    price: '3.99',
    mode: 'subscription',
    priceId: process.env.SUBSCRIPTION_PRICE_ID_GROUP2
  },
  {
    group: 3,
    countryCode: ['CO', 'BR', 'MA', 'UA', 'CL', 'BG', 'IL', 'PA'],
    //   country: ['Colombia', 'Brazil', 'Morocco', 'Ukraine', 'Chile', 'Bulgaria', 'Israel', 'Panama'],
    //   discount: '40%',
    //   code: "40DISCT",
    price: '4.99',
    mode: 'subscription',
    priceId: process.env.SUBSCRIPTION_PRICE_ID_GROUP3
  },
  {
    group: 4,
    countryCode: ['BA', 'EC', 'CZ', 'JP', 'HR', 'MX', 'CA', 'SG', 'KR', 'AU', 'HK', 'PT'],
    // country: ['Bosnia', 'Ecuador', 'Czech Republic', 'Japan', 'Croatia', 'Mexico', 'Canada', 'Singapore', 'South Korea', 'Australia', 'Hong Kong', 'Portugal'],
    //   discount: '30%',
    //   code: "30DEALS",
    price: '5.99',
    mode: 'subscription',
    priceId: process.env.SUBSCRIPTION_PRICE_ID_GROUP4
  }
  //   {
  //     group: 5,
  //     countryCode: ['CN'],
  //  //   country: ['China'],
  //   //  discount: '30%',
  //   //  code: "30DEALS",
  //     price: "19",
  //     mode: "payment",
  //     priceId: process.env.ONETIME_PRICE_ID,
  //   }
]
