export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  style: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: "professional-poster",
    name: "Professional Marketing Poster",
    description: "High-end marketing poster with professional typography and layout",
    style: "professional",
    template: `Transform this into a premium marketing poster. Add professional headline, subhead, and CTA button. Use {themeColor} as primary color. Apply professional design principles: proper spacing, typography hierarchy, visual balance. Create depth with shadows/gradients. Text must look professionally integrated, not overlaid. Result should look like professional graphic design.`
  },
  {
    id: "luxury-brand",
    name: "Luxury Brand Poster",
    description: "Premium luxury brand aesthetic with sophisticated design elements",
    style: "luxury",
    template: `Transform this into a luxury brand poster. Add sophisticated headline, subhead, and CTA. Use {themeColor} elegantly. Apply luxury design: minimalism, elegance, refined spacing. Create visual sophistication through typography and layout. Text must appear professionally crafted. Result should convey premium quality.`
  },
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    description: "Clean, modern design with minimalist aesthetic",
    style: "minimal",
    template: `Transform this into a modern minimalist poster. Add clean headline, subhead, and CTA. Use {themeColor} strategically. Apply modern principles: simplicity, clarity, white space. Keep design minimal but impactful. Text must be highly readable and professionally styled. Result should look contemporary and professional.`
  },
  {
    id: "bold-dynamic",
    name: "Bold & Dynamic",
    description: "High-impact design with bold typography and dynamic elements",
    style: "bold",
    template: `Transform this into a bold, dynamic poster. Add dramatic headline, subhead, and CTA. Use {themeColor} boldly for maximum impact. Create high-impact design with strong visual hierarchy. Apply dynamic principles: energy, movement, visual excitement. Text must be highly readable despite bold styling. Result should be eye-catching and memorable.`
  },
  {
    id: "elegant-classic",
    name: "Elegant Classic",
    description: "Timeless, elegant design with classic typography",
    style: "classic",
    template: `Transform this into an elegant classic poster. Add timeless headline, subhead, and CTA. Use {themeColor} with sophistication. Apply classic principles: balance, proportion, elegance. Create visual sophistication through typography and layout. Text must appear professionally crafted. Result should convey timeless elegance.`
  }
];

export function getPromptTemplate(templateId: string): PromptTemplate | undefined {
  return promptTemplates.find(t => t.id === templateId);
}

export function generateEnhancedPrompt(
  basePrompt: string, 
  template: PromptTemplate, 
  themeColor: string, 
  aspectRatio: string
): string {
  return template.template
    .replace(/{themeColor}/g, themeColor)
    .replace(/{aspectRatio}/g, aspectRatio)
    .replace(/{basePrompt}/g, basePrompt);
}
