"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, Archive } from "lucide-react"
import { type AspectRatio, type CompositionData, composeToCanvas } from "@/lib/compose"
import JSZip from "jszip"
import saveAs from "file-saver"
import { Player } from "@lottiefiles/react-lottie-player"
import animationData from "@/src/theme/gradient loader 01.json"

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
  const [rendering, setRendering] = useState<Record<AspectRatio, boolean>>(() => {
    const initialRenderingState: Record<AspectRatio, boolean> = {
      "1:1": false,
      "4:5": false,
      "9:16": false,
    }
    ratios.forEach(ratio => {
      initialRenderingState[ratio] = false
    })
    return initialRenderingState
  })

  useEffect(() => {
    console.log("useEffect triggered - compositions changed:", compositions)
    console.log("Available ratios:", ratios)
    
    // Render compositions when they change
    ratios.forEach(async (ratio) => {
      const composition = compositions[ratio]
      const canvas = canvasRefs.current[ratio]

      console.log(`Processing ratio ${ratio}:`, {
        hasComposition: !!composition,
        hasCanvas: !!canvas,
        composition: composition ? {
          hasBackground: !!composition.background,
          backgroundType: composition.background?.substring(0, 50),
          hasPhotos: composition.photos.length > 0,
          hasLogo: !!composition.logo,
          hasCopy: !!composition.copy
        } : null
      })

      if (composition && canvas) {
        console.log(`Starting to render composition for ${ratio}`)
        
        // Small delay to ensure canvas is ready
        setTimeout(async () => {
          setRendering((prev) => ({
            ...prev,
            [ratio]: true,
          }))
          try {
            await composeToCanvas(canvas, ratio, composition)
            console.log(`Successfully rendered composition for ${ratio}`)
          } catch (error) {
            console.error("Failed to render composition:", error)
          } finally {
            setRendering((prev) => ({ ...prev, [ratio]: false }))
          }
        }, 100)
      } else {
        console.log(`Skipping ${ratio} - missing composition or canvas:`, {
          hasComposition: !!composition,
          hasCanvas: !!canvas
        })
      }
    })
  }, [compositions, ratios])

  const downloadPNG = async (ratio: AspectRatio) => {
    const canvas = canvasRefs.current[ratio]
    if (!canvas) {
      console.error("No canvas found for ratio:", ratio)
      return
    }

    // Check if canvas has content
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("No 2D context found for canvas")
      return
    }

    // Check if canvas has any non-transparent pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData.data.some((pixel, index) => {
      if (index % 4 === 3) { // Alpha channel
        return pixel > 0
      }
      return false
    })

    if (!hasContent) {
      console.error("Canvas appears to be empty or transparent")
      return
    }

    console.log(`Downloading PNG for ${ratio}, canvas size:`, canvas.width, 'x', canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log(`Blob created successfully, size:`, blob.size)
          saveAs(blob, `promo-${ratio.replace(":", "x")}.png`)
        } else {
          console.error("Failed to create blob from canvas")
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
                        <Player
                          autoplay
                          loop
                          src={animationData}
                          style={{ height: '100px', width: '100px' }}
                        ></Player>
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    </div>
                  ) : compositions[ratio]?.background ? (
                    <div className="space-y-4">
                      {/* Canvas for composition */}
                      <div className="relative">
                        <canvas
                          ref={(el) => {
                            console.log(`Canvas ref callback for ${ratio}:`, el)
                            canvasRefs.current[ratio] = el
                            if (el) {
                              console.log(`Canvas ref set for ${ratio}:`, {
                                width: el.width,
                                height: el.height,
                                clientWidth: el.clientWidth,
                                clientHeight: el.clientHeight
                              })
                              
                              // Try to render immediately if we have a composition
                              const composition = compositions[ratio]
                              if (composition) {
                                console.log(`Canvas ready, attempting immediate render for ${ratio}`)
                                setTimeout(() => {
                                  composeToCanvas(el, ratio, composition)
                                    .then(() => console.log(`Immediate render successful for ${ratio}`))
                                    .catch((error) => console.error(`Immediate render failed for ${ratio}:`, error))
                                }, 50)
                              }
                            }
                          }}
                          className="border rounded-lg shadow-sm max-w-full h-auto"
                          style={{
                            maxWidth: "400px",
                            aspectRatio: ratio === "1:1" ? "1/1" : ratio === "4:5" ? "4/5" : "9/16",
                            width: "400px",
                            height: ratio === "1:1" ? "400px" : ratio === "4:5" ? "500px" : "711px",
                          }}
                        />
                        
                        {/* Canvas status indicator */}
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Canvas Ready
                        </div>
                        
                        {/* Canvas dimensions debug */}
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          {canvasRefs.current[ratio]?.width || 0} x {canvasRefs.current[ratio]?.height || 0}
                        </div>
                      </div>
                      
                      {/* Debug info */}
                      <div className="text-center p-2 bg-gray-100 rounded text-xs">
                        <p>Canvas Debug Info:</p>
                        <p>Background: {compositions[ratio]?.background?.substring(0, 50)}...</p>
                        <p>Photos: {compositions[ratio]?.photos?.length || 0}</p>
                        <p>Logo: {compositions[ratio]?.logo ? 'Yes' : 'No'}</p>
                        <p>Copy: {compositions[ratio]?.copy ? 'Yes' : 'No'}</p>
                      </div>
                      
                      {/* Fallback: Direct image display */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Background Preview:</p>
                        <img
                          src={compositions[ratio]?.background}
                          alt="Generated background"
                          className="border rounded-lg shadow-sm max-w-full h-auto"
                          style={{
                            maxWidth: "200px",
                            aspectRatio: ratio === "1:1" ? "1/1" : ratio === "4:5" ? "4/5" : "9/16",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center bg-muted rounded-lg"
                      style={{
                        width: "400px",
                        height: ratio === "1:1" ? "400px" : ratio === "4:5" ? "500px" : "711px",
                      }}
                    >
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">No composition available</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  <Button 
                    onClick={() => downloadPNG(ratio)} 
                    disabled={!compositions[ratio] || rendering[ratio]}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  
                  {/* Debug button to manually trigger rendering */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const composition = compositions[ratio]
                      const canvas = canvasRefs.current[ratio]
                      if (composition && canvas) {
                        console.log(`Manual render trigger for ${ratio}`)
                        setRendering((prev) => ({ ...prev, [ratio]: true }))
                        composeToCanvas(canvas, ratio, composition)
                          .then(() => {
                            console.log(`Manual render completed for ${ratio}`)
                            setRendering((prev) => ({ ...prev, [ratio]: false }))
                          })
                          .catch((error) => {
                            console.error(`Manual render failed for ${ratio}:`, error)
                            setRendering((prev) => ({ ...prev, [ratio]: false }))
                          })
                      }
                    }}
                    disabled={!compositions[ratio]}
                  >
                    Debug Render
                  </Button>
                  
                  {/* Test canvas functionality */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const canvas = canvasRefs.current[ratio]
                      if (canvas) {
                        console.log(`Testing canvas for ${ratio}`)
                        const ctx = canvas.getContext("2d")
                        if (ctx) {
                          // Set canvas size
                          canvas.width = 400
                          canvas.height = ratio === "1:1" ? 400 : ratio === "4:5" ? 500 : 711
                          
                          // Draw a simple test pattern
                          ctx.fillStyle = "#ff0000"
                          ctx.fillRect(0, 0, canvas.width, canvas.height)
                          
                          ctx.fillStyle = "#00ff00"
                          ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)
                          
                          ctx.fillStyle = "#0000ff"
                          ctx.font = "24px Arial"
                          ctx.fillText("Canvas Test", 100, 100)
                          
                          console.log("Test pattern drawn to canvas")
                        }
                      }
                    }}
                  >
                    Test Canvas
                  </Button>
                  
                  {/* Force render composition */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const composition = compositions[ratio]
                      const canvas = canvasRefs.current[ratio]
                      if (composition && canvas) {
                        console.log(`Force rendering composition for ${ratio}`)
                        console.log('Composition data:', composition)
                        
                        // Clear canvas first
                        const ctx = canvas.getContext("2d")
                        if (ctx) {
                          ctx.clearRect(0, 0, canvas.width, canvas.height)
                        }
                        
                        setRendering((prev) => ({ ...prev, [ratio]: true }))
                        composeToCanvas(canvas, ratio, composition)
                          .then(() => {
                            console.log(`Force render completed for ${ratio}`)
                            setRendering((prev) => ({ ...prev, [ratio]: false }))
                          })
                          .catch((error) => {
                            console.error(`Force render failed for ${ratio}:`, error)
                            setRendering((prev) => ({ ...prev, [ratio]: false }))
                          })
                      }
                    }}
                    disabled={!compositions[ratio]}
                  >
                    Force Render
                  </Button>
                  
                  {/* Draw just background */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const composition = compositions[ratio]
                      const canvas = canvasRefs.current[ratio]
                      if (composition?.background && canvas) {
                        console.log(`Drawing just background for ${ratio}`)
                        
                        const ctx = canvas.getContext("2d")
                        if (ctx) {
                          // Set canvas size
                          canvas.width = 400
                          canvas.height = ratio === "1:1" ? 400 : ratio === "4:5" ? 500 : 711
                          
                          // Clear canvas
                          ctx.clearRect(0, 0, canvas.width, canvas.height)
                          
                          // Draw background image
                          const img = new Image()
                          img.onload = () => {
                            console.log("Background image loaded for direct draw")
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                            console.log("Background drawn directly to canvas")
                          }
                          img.onerror = (error) => {
                            console.error("Failed to load background image for direct draw:", error)
                          }
                          img.src = composition.background
                        }
                      }
                    }}
                    disabled={!compositions[ratio]?.background}
                  >
                    Draw Background Only
                  </Button>
                  
                  {/* Simple canvas test */}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const canvas = canvasRefs.current[ratio]
                      if (canvas) {
                        console.log(`Simple canvas test for ${ratio}`)
                        
                        const ctx = canvas.getContext("2d")
                        if (ctx) {
                          // Set canvas size
                          canvas.width = 400
                          canvas.height = ratio === "1:1" ? 400 : ratio === "4:5" ? 500 : 711
                          
                          // Clear canvas
                          ctx.clearRect(0, 0, canvas.width, canvas.height)
                          
                          // Draw a simple pattern
                          ctx.fillStyle = "#ff0000"
                          ctx.fillRect(0, 0, canvas.width, canvas.height)
                          
                          ctx.fillStyle = "#00ff00"
                          ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)
                          
                          ctx.fillStyle = "#0000ff"
                          ctx.font = "24px Arial"
                          ctx.fillText("Canvas Working!", 100, 100)
                          
                          console.log("Simple pattern drawn to canvas")
                        }
                      }
                    }}
                  >
                    Simple Test
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
