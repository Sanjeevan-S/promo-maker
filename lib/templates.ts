export interface Template {
  id: string
  label: string
  tone: "friendly" | "bold" | "minimal" | "festive"
  copyPrompt: string
  imagePrompt: string
  typography: {
    headlineFont: string
    subheadFont: string
    ctaFont: string
  }
  layout: {
    "1:1": {
      textZone: "top" | "middle" | "bottom"
      frames: "single" | "double" | "triple"
      logoPos: "tl" | "tr" | "bl" | "br"
    }
    "4:5": {
      textZone: "top" | "middle" | "bottom"
      frames: "single" | "double" | "triple"
      logoPos: "tl" | "tr" | "bl" | "br"
    }
    "9:16": {
      textZone: "top" | "middle" | "bottom"
      frames: "single" | "double" | "triple"
      logoPos: "tl" | "tr" | "bl" | "br"
    }
  }
}

export const templates: Template[] = [
  {
    id: "clean-gradient",
    label: "Clean Solid",
    tone: "minimal",
    copyPrompt: "Create clean, minimal copy that emphasizes simplicity and elegance",
    imagePrompt: "Clean solid color background with subtle geometric patterns, minimal design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "bottom", frames: "double", logoPos: "tl" },
      "4:5": { textZone: "top", frames: "single", logoPos: "tr" },
      "9:16": { textZone: "middle", frames: "single", logoPos: "tl" },
    },
  },
  {
    id: "bokeh-studio",
    label: "Bokeh Studio",
    tone: "friendly",
    copyPrompt: "Create warm, friendly copy that feels approachable and inviting",
    imagePrompt: "Soft bokeh background with warm studio lighting, simple and minimal design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "top", frames: "triple", logoPos: "br" },
      "4:5": { textZone: "bottom", frames: "double", logoPos: "tl" },
      "9:16": { textZone: "top", frames: "single", logoPos: "br" },
    },
  },
  {
    id: "coupon-slash",
    label: "Coupon Slash",
    tone: "bold",
    copyPrompt: "Create bold, attention-grabbing copy with strong call-to-action language",
    imagePrompt: "Dynamic diagonal slash patterns with high contrast solid colors, minimal design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "middle", frames: "single", logoPos: "tr" },
      "4:5": { textZone: "top", frames: "double", logoPos: "bl" },
      "9:16": { textZone: "bottom", frames: "single", logoPos: "tl" },
    },
  },
  {
    id: "collage-grid",
    label: "Collage Grid",
    tone: "friendly",
    copyPrompt: "Create playful, engaging copy that feels creative and fun",
    imagePrompt: "Geometric grid patterns with soft textures and organic shapes, simple design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "bottom", frames: "triple", logoPos: "tl" },
      "4:5": { textZone: "middle", frames: "double", logoPos: "tr" },
      "9:16": { textZone: "top", frames: "triple", logoPos: "bl" },
    },
  },
  {
    id: "concrete-texture",
    label: "Concrete Texture",
    tone: "bold",
    copyPrompt: "Create strong, industrial copy that conveys durability and strength",
    imagePrompt: "Concrete texture background with industrial elements and shadows, minimal design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "top", frames: "single", logoPos: "br" },
      "4:5": { textZone: "bottom", frames: "single", logoPos: "tl" },
      "9:16": { textZone: "middle", frames: "double", logoPos: "tr" },
    },
  },
  {
    id: "night-neon",
    label: "Night Neon",
    tone: "festive",
    copyPrompt: "Create exciting, celebratory copy with energy and enthusiasm",
    imagePrompt: "Dark background with neon lighting effects and vibrant solid colors, minimal design leaving center space clear for product overlay",
    typography: {
      headlineFont: "font-sans",
      subheadFont: "font-sans",
      ctaFont: "font-sans",
    },
    layout: {
      "1:1": { textZone: "middle", frames: "double", logoPos: "tl" },
      "4:5": { textZone: "top", frames: "triple", logoPos: "br" },
      "9:16": { textZone: "bottom", frames: "single", logoPos: "tr" },
    },
  },
] as const
