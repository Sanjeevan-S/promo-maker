import { getPromptTemplate } from './prompt-templates'

export interface EnhancedPromptOptions {
  basePrompt: string
  promptStyle: string
  themeColor: string
  aspectRatio: string
  userDescription: string
  hasLogo: boolean
  hasPhotos: boolean
}

export function createEnhancedPrompt(options: EnhancedPromptOptions): string {
  const {
    basePrompt,
    promptStyle,
    themeColor,
    aspectRatio,
    userDescription,
    hasLogo,
    hasPhotos
  } = options

  const template = getPromptTemplate(promptStyle)
  
  // Concise enhancement that applies to all styles
  const baseEnhancement = `Create professional poster with ${promptStyle} style. Use ${themeColor} as primary color. Apply professional design principles: spacing, hierarchy, balance. Text must look integrated, not overlaid. Result should look like professional graphic design for ${aspectRatio} format.`

  // Style-specific concise enhancements
  const styleEnhancements: Record<string, string> = {
    'professional-poster': 'Modern corporate aesthetics, professional typography, business-appropriate layout.',
    'luxury-brand': 'Elegant premium aesthetic, sophisticated typography, luxury design principles.',
    'modern-minimal': 'Clean uncluttered design, modern typography, plenty of white space.',
    'bold-dynamic': 'High-impact design, bold typography, dynamic visual elements.',
    'elegant-classic': 'Timeless elegant aesthetic, classic typography, sophisticated layout.'
  }

  const styleEnhancement = styleEnhancements[promptStyle] || styleEnhancements['professional-poster']

  // Context-specific concise enhancements
  const contextEnhancement = `User message: "${userDescription}". ${hasLogo ? 'Integrate logo professionally.' : 'Focus on typography.'} ${hasPhotos ? 'Integrate photos seamlessly.' : 'Create compelling visuals.'}`

  // Combine everything concisely
  const finalPrompt = `${basePrompt} ${baseEnhancement} ${styleEnhancement} ${contextEnhancement}`

  // Ensure we don't exceed DALL-E 2's 1000 character limit
  if (finalPrompt.length > 950) {
    // If too long, use a more concise version
    return `${basePrompt} Create professional ${promptStyle} poster using ${themeColor}. Apply professional design principles. Text must look integrated, not overlaid. Result should look professionally designed.`
  }

  return finalPrompt
}
