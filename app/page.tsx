"use client"

import { useState, useCallback } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Uploader } from "@/components/Uploader"
import { Controls } from "@/components/Controls"
import { PreviewTabs } from "@/components/PreviewTabs"
import { templates } from "@/lib/templates"
import { promptTemplates } from "@/lib/prompt-templates"
import type { AspectRatio, CompositionData } from "@/lib/compose"
import type { ColorInfo } from "@/lib/colors"

export default function PromoMaker() {
  const { toast } = useToast()

  // State
  const [photos, setPhotos] = useState<string[]>([])
  const [logo, setLogo] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState("#F14A52") // Default primary color
  const [description, setDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [selectedRatios, setSelectedRatios] = useState<AspectRatio[]>(["1:1", "4:5", "9:16"])
  const [selectedPromptStyle, setSelectedPromptStyle] = useState("professional-poster") // New state for prompt style
  const [extractedColors, setExtractedColors] = useState<ColorInfo[]>([]) // New state for extracted colors
  const [selectedPaletteColor, setSelectedPaletteColor] = useState<string | null>(null) // New state for selected color from palette
  const [compositions, setCompositions] = useState<Record<AspectRatio, CompositionData | null>>({
    "1:1": null,
    "4:5": null,
    "9:16": null,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const canGenerate = photos.length > 0 && description.trim().length > 0 && selectedRatios.length > 0

  const handleError = useCallback(
    (error: string) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    },
    [toast],
  )

  const handleLogoColorExtraction = useCallback((colors: ColorInfo[]) => {
    setExtractedColors(colors);
    if (colors.length > 0) {
      setSelectedPaletteColor(colors[0].hex);
      setThemeColor(colors[0].hex); // Also set themeColor when logo colors are extracted
    } else {
      setSelectedPaletteColor(null);
      setThemeColor("#F14A52"); // Reset to default if no colors extracted
    }
  }, [setExtractedColors, setSelectedPaletteColor, setThemeColor]);

  const handlePaletteColorSelection = useCallback((color: string) => {
    setSelectedPaletteColor(color);
    setThemeColor(color); // Update themeColor when a palette color is selected
  }, [setSelectedPaletteColor, setThemeColor]);

  const generateCopy = async () => {
    const template = templates.find((t) => t.id === selectedTemplate)!

    try {
      const response = await fetch("/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userDescription: description,
          templateId: selectedTemplate,
          tone: template.tone,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate copy")

      return await response.json()
    } catch (error) {
      throw new Error("Failed to generate copy")
    }
  }

  const generatePrompt = async (ratio: AspectRatio) => {
    const template = templates.find((t) => t.id === selectedTemplate)!

    try {
      const response = await fetch("/api/prompt-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userDescription: description,
          templateStyle: template.label,
          aspectRatio: ratio,
          themeColor,
          hasLogo: !!logo,
          hasPhotos: photos.length > 0,
          promptStyle: selectedPromptStyle,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate prompt")

      const data = await response.json()
      return data.prompt
    } catch (error) {
      throw new Error("Failed to generate prompt")
    }
  }

  const generatePromotionalImage = async (prompt: string, ratio: AspectRatio, baseImageUrl: string) => {
    try {
      // Convert blob URL to base64 data
      let imageData = baseImageUrl
      
      if (baseImageUrl.startsWith('blob:')) {
        // Fetch the blob and convert to base64
        const response = await fetch(baseImageUrl)
        const blob = await response.blob()
        
        // Convert blob to base64
        const reader = new FileReader()
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }

      const response = await fetch("/api/image-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          aspectRatio: ratio, 
          userImage: imageData,
          promptStyle: selectedPromptStyle,
          themeColor,
          userDescription: description,
          hasLogo: !!logo,
          hasPhotos: photos.length > 0
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Validate that we got a valid image URL
      if (!data.imageUrl || typeof data.imageUrl !== 'string') {
        throw new Error("Invalid image data received")
      }
      
      return data.imageUrl
    } catch (error) {
      console.error("Error generating promotional image:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to generate promotional image")
    }
  }

  const generateBackground = async (ratio: AspectRatio, seed?: number) => {
    const template = templates.find((t) => t.id === selectedTemplate)!

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          themeColor,
          ratio,
          textZone: template.layout[ratio].textZone,
          seed,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate background")

      const data = await response.json()
      return data.backgroundDataUrl
    } catch (error) {
      throw new Error("Failed to generate background")
    }
  }

  const handleGenerate = async () => {
    if (!canGenerate) return

    setIsGenerating(true)

    try {
      // Generate copy once
      const copy = await generateCopy()
      console.log("Generated copy:", copy)
      const template = templates.find((t) => t.id === selectedTemplate)!

      // Generate backgrounds and compositions for each ratio
      const newCompositions: Record<AspectRatio, CompositionData | null> = {
        "1:1": null,
        "4:5": null,
        "9:16": null,
      }

      for (const ratio of selectedRatios) {
        // Generate comprehensive prompt for this ratio
        const prompt = await generatePrompt(ratio)
        
        // Use the first uploaded photo as the base image for editing
        const baseImage = photos[0]
        if (!baseImage) {
          throw new Error("No photos uploaded for editing")
        }
        
        // Generate promotional image by editing the user's image
        const promotionalImage = await generatePromotionalImage(prompt, ratio, baseImage)
        
        console.log(`Generated image for ${ratio}:`, promotionalImage?.substring(0, 100) + '...')
        
        // Validate the generated image
        if (!promotionalImage || !promotionalImage.startsWith('data:image/')) {
          console.error(`Invalid image data for ${ratio}:`, promotionalImage)
          throw new Error(`Failed to generate valid image for ${ratio}`)
        }

        newCompositions[ratio] = {
          background: promotionalImage, // Use the edited promotional image as background
          photos,
          logo: logo || undefined, // Convert null to undefined to match the expected type
          themeColor,
          copy,
          template,
        }
      }

      setCompositions(newCompositions)

              toast({
          title: "Success",
          description: "Promo images edited successfully!",
        })
    } catch (error) {
      handleError("Failed to edit promo images")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRerollBackground = async (ratio: AspectRatio) => {
    if (!compositions[ratio]) return

    try {
      // Generate a new comprehensive prompt for this ratio
      const prompt = await generatePrompt(ratio)
      
              // Use the first uploaded photo as the base image for editing
        const baseImage = photos[0]
        if (!baseImage) {
          throw new Error("No photos uploaded for editing")
        }
        
        // Generate new promotional image by editing the user's image
        const promotionalImage = await generatePromotionalImage(prompt, ratio, baseImage)
        
        console.log(`Rerolled image for ${ratio}:`, promotionalImage?.substring(0, 100) + '...')
        
        // Validate the generated image
        if (!promotionalImage || !promotionalImage.startsWith('data:image/')) {
          console.error(`Invalid image data for ${ratio}:`, promotionalImage)
          throw new Error(`Failed to generate valid image for ${ratio}`)
        }

        setCompositions((prev) => ({
          ...prev,
          [ratio]: prev[ratio] ? { ...prev[ratio]!, background: promotionalImage } : null,
        }))

              toast({
          title: "Image updated",
          description: `New text overlay generated for ${ratio} format`,
        })
    } catch (error) {
      handleError("Failed to generate new background")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Promo Maker</h1>
            <p className="text-sm text-muted-foreground">
              Create stunning promotional images by editing your photos with AI-powered text overlays
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <Uploader
              photos={photos}
              logo={logo}
              onPhotosChange={setPhotos}
              onLogoChange={setLogo}
              onError={handleError}
              onExtractedColorsChange={handleLogoColorExtraction} // Pass the handler for extracted colors
            />

            <Controls
              themeColor={themeColor}
              description={description}
              selectedTemplate={selectedTemplate}
              selectedRatios={selectedRatios}
              selectedPromptStyle={selectedPromptStyle}
              extractedColors={extractedColors} // Pass extracted colors
              selectedPaletteColor={selectedPaletteColor} // Pass selected palette color
              onThemeColorChange={setThemeColor}
              onDescriptionChange={setDescription}
              onTemplateChange={setSelectedTemplate}
              onRatiosChange={setSelectedRatios}
              onPromptStyleChange={setSelectedPromptStyle}
              onPaletteColorSelect={handlePaletteColorSelection} // Pass handler for palette color selection
              onGenerate={handleGenerate}
              canGenerate={canGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <PreviewTabs
              ratios={selectedRatios}
              compositions={compositions}
              isGenerating={isGenerating}
              onRerollBackground={handleRerollBackground}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
