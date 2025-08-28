"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, Archive } from "lucide-react"
import { type AspectRatio, type CompositionData, composeToCanvas } from "@/lib/compose"
import JSZip from "jszip"
import saveAs from "file-saver"

interface PreviewTabsProps {
  ratios: AspectRatio[]
  compositions: Record<AspectRatio, CompositionData | null>
  isGenerating: boolean
  onRerollBackground: (ratio: AspectRatio) => void
}

export function PreviewTabs({ ratios, compositions, isGenerating, onRerollBackground }: PreviewTabsProps) {
  const canvasRefs = useRef<Record<AspectRatio, HTMLCanvasElement | null>>({
    "1:1": null,
    "4:5": null,
    "9:16": null,
  })
  const [activeTab, setActiveTab] = useState<AspectRatio>(ratios[0] || "1:1")
  const [rendering, setRendering] = useState<Record<AspectRatio, boolean>>({})

  useEffect(() => {
    // Render compositions when they change
    ratios.forEach(async (ratio) => {
      const composition = compositions[ratio]
      const canvas = canvasRefs.current[ratio]

      if (composition && canvas) {
        setRendering((prev) => ({ ...prev, [ratio]: true }))
        try {
          await composeToCanvas(canvas, ratio, composition)
        } catch (error) {
          console.error("Failed to render composition:", error)
        } finally {
          setRendering((prev) => ({ ...prev, [ratio]: false }))
        }
      }
    })
  }, [compositions, ratios])

  const downloadPNG = async (ratio: AspectRatio) => {
    const canvas = canvasRefs.current[ratio]
    if (!canvas) return

    canvas.toBlob(
      (blob) => {
        if (blob) {
          saveAs(blob, `promo-${ratio.replace(":", "x")}.png`)
        }
      },
      "image/png",
      1.0,
    )
  }

  const downloadAllZIP = async () => {
    const zip = new JSZip()

    for (const ratio of ratios) {
      const canvas = canvasRefs.current[ratio]
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/png", 1.0)
        })

        if (blob) {
          zip.file(`promo-${ratio.replace(":", "x")}.png`, blob)
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    saveAs(zipBlob, "promo-images.zip")
  }

  const hasAnyComposition = ratios.some((ratio) => compositions[ratio])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRerollBackground(activeTab)}
            disabled={!compositions[activeTab] || isGenerating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-roll Background
          </Button>
          <Button variant="outline" size="sm" onClick={downloadAllZIP} disabled={!hasAnyComposition}>
            <Archive className="w-4 h-4 mr-2" />
            Download ZIP
          </Button>
        </div>
      </div>

      {ratios.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Select at least one aspect ratio to generate previews
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AspectRatio)}>
          <TabsList className="grid w-full grid-cols-3">
            {ratios.map((ratio) => (
              <TabsTrigger key={ratio} value={ratio}>
                {ratio}
              </TabsTrigger>
            ))}
          </TabsList>

          {ratios.map((ratio) => (
            <TabsContent key={ratio} value={ratio} className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-center">
                  {isGenerating || rendering[ratio] ? (
                    <div
                      className="flex items-center justify-center bg-muted rounded-lg"
                      style={{
                        width: "400px",
                        height: ratio === "1:1" ? "400px" : ratio === "4:5" ? "500px" : "711px",
                      }}
                    >
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    </div>
                  ) : (
                    <canvas
                      ref={(el) => (canvasRefs.current[ratio] = el)}
                      className="border rounded-lg shadow-sm max-w-full h-auto"
                      style={{
                        maxWidth: "400px",
                        aspectRatio: ratio === "1:1" ? "1/1" : ratio === "4:5" ? "4/5" : "9/16",
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-center">
                  <Button onClick={() => downloadPNG(ratio)} disabled={!compositions[ratio] || rendering[ratio]}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </Card>
  )
}
