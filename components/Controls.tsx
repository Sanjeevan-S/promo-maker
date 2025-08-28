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
import type { AspectRatio } from "@/lib/compose"

interface ControlsProps {
  themeColor: string
  description: string
  selectedTemplate: string
  selectedRatios: AspectRatio[]
  onThemeColorChange: (color: string) => void
  onDescriptionChange: (description: string) => void
  onTemplateChange: (templateId: string) => void
  onRatiosChange: (ratios: AspectRatio[]) => void
  onGenerate: () => void
  canGenerate: boolean
  isGenerating: boolean
}

export function Controls({
  themeColor,
  description,
  selectedTemplate,
  selectedRatios,
  onThemeColorChange,
  onDescriptionChange,
  onTemplateChange,
  onRatiosChange,
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
    <Card className="p-6 space-y-6">
      {/* Theme Color */}
      <div>
        <label className="text-sm font-medium mb-2 block">Theme Color</label>
        <div className="flex gap-2">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg border-2 border-muted cursor-pointer"
              style={{ backgroundColor: themeColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute top-12 left-0 z-10 bg-background border rounded-lg p-3 shadow-lg">
                <HexColorPicker color={themeColor} onChange={onThemeColorChange} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent"
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
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your product or promotion..."
          maxLength={200}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">{description.length}/200 characters</p>
      </div>

      <Separator />

      {/* Template Style */}
      <div>
        <label className="text-sm font-medium mb-2 block">Template Style</label>
        <Select value={selectedTemplate} onValueChange={onTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div>
                  <div className="font-medium">{template.label}</div>
                  <div className="text-xs text-muted-foreground capitalize">{template.tone} tone</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Aspect Ratios */}
      <div>
        <label className="text-sm font-medium mb-2 block">Aspect Ratios</label>
        <div className="space-y-2">
          {(["1:1", "4:5", "9:16"] as AspectRatio[]).map((ratio) => (
            <div key={ratio} className="flex items-center space-x-2">
              <Checkbox
                id={ratio}
                checked={selectedRatios.includes(ratio)}
                onCheckedChange={(checked) => handleRatioChange(ratio, checked as boolean)}
              />
              <label htmlFor={ratio} className="text-sm">
                {ratio} {ratio === "1:1" ? "(Square)" : ratio === "4:5" ? "(Portrait)" : "(Story)"}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Generate Button */}
      <Button onClick={onGenerate} disabled={!canGenerate || isGenerating} className="w-full" size="lg">
        {isGenerating ? "Generating..." : "Generate Promos"}
      </Button>
    </Card>
  )
}
