"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, ImageIcon } from "lucide-react"
import { downscaleImage, validateImageFile } from "@/lib/downscale"

interface UploaderProps {
  photos: string[]
  logo?: string
  onPhotosChange: (photos: string[]) => void
  onLogoChange: (logo?: string) => void
  onError: (error: string) => void
}

export function Uploader({ photos, logo, onPhotosChange, onLogoChange, onError }: UploaderProps) {
  const [dragOver, setDragOver] = useState<"photos" | "logo" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = useCallback(
    async (files: FileList, type: "photos" | "logo") => {
      setLoading(true)

      try {
        const fileArray = Array.from(files)

        for (const file of fileArray) {
          const validation = validateImageFile(file)
          if (!validation.valid) {
            onError(validation.error!)
            continue
          }

          const dataUrl = await downscaleImage(file)

          if (type === "photos") {
            if (photos.length < 3) {
              onPhotosChange([...photos, dataUrl])
            } else {
              onError("Maximum 3 photos allowed")
            }
          } else {
            onLogoChange(dataUrl)
          }
        }
      } catch (error) {
        onError("Failed to process image")
      } finally {
        setLoading(false)
      }
    },
    [photos, onPhotosChange, onLogoChange, onError],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "photos" | "logo") => {
      e.preventDefault()
      setDragOver(null)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files, type)
      }
    },
    [handleFileUpload],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: "photos" | "logo") => {
      const files = e.target.files
      if (files) {
        handleFileUpload(files, type)
      }
      e.target.value = ""
    },
    [handleFileUpload],
  )

  const removePhoto = useCallback(
    (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index)
      onPhotosChange(newPhotos)
    },
    [photos, onPhotosChange],
  )

  return (
    <div className="space-y-6">
      {/* Product Photos */}
      <div>
        <label className="text-sm font-medium mb-2 block">Product Photos (1-3)</label>

        <Card
          className={`border-2 border-dashed p-6 transition-colors ${
            dragOver === "photos" ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver("photos")
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, "photos")}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Drag & drop photos here, or click to select</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileInput(e, "photos")}
              className="hidden"
              id="photo-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("photo-upload")?.click()}
              disabled={loading || photos.length >= 3}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Select Photos
            </Button>
          </div>
        </Card>

        {/* Photo Thumbnails */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Product ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand Logo */}
      <div>
        <label className="text-sm font-medium mb-2 block">Brand Logo (Optional)</label>

        <Card
          className={`border-2 border-dashed p-6 transition-colors ${
            dragOver === "logo" ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver("logo")
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, "logo")}
        >
          {logo ? (
            <div className="relative group">
              <img src={logo || "/placeholder.svg"} alt="Brand Logo" className="mx-auto h-16 object-contain" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onLogoChange(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Drag & drop logo here, or click to select</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, "logo")}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("logo-upload")?.click()}
                disabled={loading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Select Logo
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
