"use client"

import { useState, useCallback } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Uploader } from "@/components/Uploader"
import { Controls } from "@/components/Controls"
import { PreviewTabs } from "@/components/PreviewTabs"
import { templates } from "@/lib/templates"
import type { AspectRatio, CompositionData } from "@/lib/compose"

export default function PromoMaker() {
  const { toast } = useToast()

  // State
  const [photos, setPhotos] = useState<string[]>([])
  const [logo, setLogo] = useState<string>()
  const [themeColor, setThemeColor] = useState("#3b82f6")
  const [description, setDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [selectedRatios, setSelectedRatios] = useState<AspectRatio[]>(["1:1", "4:5", "9:16"])
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
      const template = templates.find((t) => t.id === selectedTemplate)!

      // Generate backgrounds and compositions for each ratio
      const newCompositions: Record<AspectRatio, CompositionData | null> = {
        "1:1": null,
        "4:5": null,
        "9:16": null,
      }

      for (const ratio of selectedRatios) {
        const background = await generateBackground(ratio)

        newCompositions[ratio] = {
          background,
          photos,
          logo,
          themeColor,
          copy,
          template,
        }
      }

      setCompositions(newCompositions)

      toast({
        title: "Success",
        description: "Promo images generated successfully!",
      })
    } catch (error) {
      handleError("Failed to generate promo images")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRerollBackground = async (ratio: AspectRatio) => {
    if (!compositions[ratio]) return

    try {
      const seed = Math.floor(Math.random() * 10000)
      const background = await generateBackground(ratio, seed)

      setCompositions((prev) => ({
        ...prev,
        [ratio]: prev[ratio] ? { ...prev[ratio]!, background } : null,
      }))

      toast({
        title: "Background updated",
        description: `New background generated for ${ratio} format`,
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
              Create stunning promotional images with AI-powered backgrounds and copy
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
            />

            <Controls
              themeColor={themeColor}
              description={description}
              selectedTemplate={selectedTemplate}
              selectedRatios={selectedRatios}
              onThemeColorChange={setThemeColor}
              onDescriptionChange={setDescription}
              onTemplateChange={setSelectedTemplate}
              onRatiosChange={setSelectedRatios}
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
