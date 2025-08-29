"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { HexColorPicker } from "react-colorful"
import { templates } from "@/lib/templates"
import { promptTemplates } from "@/lib/prompt-templates"
import type { AspectRatio } from "@/lib/compose"
import type { ColorInfo } from "@/lib/colors"

interface ControlsProps {
  themeColor: string
  description: string
  selectedTemplate: string
  selectedRatios: AspectRatio[]
  selectedPromptStyle: string // New prop for prompt style
  extractedColors: ColorInfo[] // New prop for extracted colors
  selectedPaletteColor: string | null // New prop for selected color from palette
  onThemeColorChange: (color: string) => void
  onDescriptionChange: (description: string) => void
  onTemplateChange: (templateId: string) => void
  onRatiosChange: (ratios: AspectRatio[]) => void
  onPromptStyleChange: (style: string) => void // New prop for prompt style change
  onPaletteColorSelect: (color: string) => void // New prop for palette color selection
  onGenerate: () => void
  canGenerate: boolean
  isGenerating: boolean
}

export function Controls({
  themeColor,
  description,
  selectedTemplate,
  selectedRatios,
  selectedPromptStyle,
  extractedColors,
  selectedPaletteColor,
  onThemeColorChange,
  onDescriptionChange,
  onTemplateChange,
  onRatiosChange,
  onPromptStyleChange,
  onPaletteColorSelect,
  onGenerate,
  canGenerate,
  isGenerating,
}: ControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleRatioChange = (ratio: AspectRatio, checked: boolean) => {
    if (checked) {
      onRatiosChange([...selectedRatios, ratio])
    } else {
      onRatiosChange(selectedRatios.filter((r) => r !== ratio))
    }
  }

  const handleHexInput = (value: string) => {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onThemeColorChange(value)
    }
  }

  return (
    <Card className="p-6 space-y-6 border-primary/20">
      {/* Theme Color */}
      <div>
        <label className="text-sm font-bold tracking-tight mb-2 block text-primary">Theme Color</label>
        <div className="flex gap-2">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg border-2 border-primary/20 cursor-pointer hover:border-primary/30 transition-colors"
              style={{ backgroundColor: themeColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute top-12 left-0 z-10 bg-background border border-primary/20 rounded-lg p-3 shadow-modern-primary">
                <HexColorPicker color={themeColor} onChange={onThemeColorChange} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => setShowColorPicker(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
          <Input
            value={themeColor}
            onChange={(e) => handleHexInput(e.target.value)}
            placeholder="#000000"
            className="flex-1 border-primary/20 focus:ring-primary/20"
          />
        </div>

        {/* Extracted Logo Colors (now inside Theme Color section) */}
        {extractedColors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold tracking-tight text-primary/80 mb-2">From Logo:</h4>
            <div className="flex flex-wrap gap-2">
              {extractedColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onPaletteColorSelect(color.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedPaletteColor === color.hex 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-primary/20'
                  } hover:border-primary/30 transition-colors`}
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                  }}
                  title={`${color.hex} (${color.count} pixels)`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-primary/20" />

      {/* Description */}
      <div>
        <label className="text-sm font-bold tracking-tight mb-2 block text-primary">Description</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your product or promotion..."
          maxLength={200}
          className="resize-none border-primary/20 focus:ring-primary/20"
        />
        <p className="text-xs text-primary/60 mt-1">{description.length}/200 characters</p>
      </div>

      <Separator className="bg-primary/20" />

      {/* Template Style */}
      <div>
        <label className="text-sm font-bold tracking-tight mb-2 block text-primary">Template Style</label>
        <Select value={selectedTemplate} onValueChange={onTemplateChange}>
          <SelectTrigger className="border-primary/20 focus:ring-primary/20">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent className="border-primary/20">
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id} className="focus:bg-primary/5">
                <div>
                  <div className="font-bold">{template.label}</div>
                  <div className="text-xs text-primary/60 capitalize">{template.tone} tone</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-primary/20" />

      {/* Prompt Style */}
      <div>
        <label className="text-sm font-bold tracking-tight mb-2 block text-primary">Design Style</label>
        <Select value={selectedPromptStyle} onValueChange={onPromptStyleChange}>
          <SelectTrigger className="border-primary/20 focus:ring-primary/20">
            <SelectValue placeholder="Select a design style" />
          </SelectTrigger>
          <SelectContent className="border-primary/20">
            {promptTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id} className="focus:bg-primary/5">
                <div>
                  <div className="font-bold">{template.name}</div>
                  <div className="text-xs text-primary/60">{template.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-primary/20" />

      {/* Aspect Ratios */}
      <div>
        <label className="text-sm font-bold tracking-tight mb-2 block text-primary">Aspect Ratios</label>
        <div className="space-y-2">
          {(["1:1", "4:5", "9:16"] as AspectRatio[]).map((ratio) => (
            <div key={ratio} className="flex items-center space-x-2">
              <Checkbox
                id={ratio}
                checked={selectedRatios.includes(ratio)}
                onCheckedChange={(checked) => handleRatioChange(ratio, checked as boolean)}
                className="border-primary/20 text-primary focus:ring-primary/20"
              />
              <label htmlFor={ratio} className="text-sm text-primary">
                {ratio} {ratio === "1:1" ? "(Square)" : ratio === "4:5" ? "(Portrait)" : "(Story)"}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Generate Button */}
      <Button 
        onClick={onGenerate} 
        disabled={!canGenerate || isGenerating} 
        className="w-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 focus:ring-primary/20 disabled:opacity-40"
        size="lg"
      >
        {isGenerating ? "Editing..." : "Edit Images with Text"}
      </Button>
    </Card>
  )
}
