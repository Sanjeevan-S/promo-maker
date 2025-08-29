'use client';
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import Lottie from 'lottie-react';
import gradientLoaderAnimation from '@/src/theme/gradient loader 01.json';
import { X, Upload } from 'lucide-react';
import type { ColorInfo } from '@/lib/colors'; // Import ColorInfo from lib/colors.ts

// Define interfaces for image storage
interface ImagePair {
  id: string;
  original: string;
  processed: string | null;
}

interface UploaderProps {
  photos: string[];
  logo: string | null;
  onPhotosChange: (photos: string[]) => void;
  onLogoChange: (logo: string | null) => void;
  onError: (error: string) => void;
  onExtractedColorsChange: (colors: ColorInfo[]) => void; // New prop for extracted colors
}

export function Uploader({
  photos,
  logo,
  onPhotosChange,
  onLogoChange,
  onError,
  onExtractedColorsChange,
}: UploaderProps) {
  const [images, setImages] = useState<ImagePair[]>([]);
  // Removed: const [extractedColors, setExtractedColors] = useState<ColorInfo[]>([]);
  // Removed: const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isColorExtracting, setIsColorExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null); // New state for image file name
  const [logoFileName, setLogoFileName] = useState<string | null>(null);   // New state for logo file name
  // Removed: const [aiPrompt, setAiPrompt] = useState<string>(''); // New state for AI image generation prompt
  // Removed: const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false); // New state for AI image generation loading

  // Utility color conversion functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  };

  // These utility functions are now in lib/colors.ts, so they are not needed here
  // const adjustColorBrightness = (hex: string, percent: number): string => { /* ... */ };
  // const generateColorVariations = (baseColor: string): string[] => { /* ... */ };

  const extractColorsFromImage = (imageUrl: string): Promise<ColorInfo[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const colorMap = new Map<string, ColorInfo>();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 20) continue;

          const hsl = rgbToHsl(r, g, b);
          
          if (hsl.s < 0.1 || hsl.l < 0.1 || hsl.l > 0.9) continue;

          const hex = rgbToHex(r, g, b);
          
          const existingColor = colorMap.get(hex);
          if (existingColor) {
            existingColor.count++;
          } else {
            colorMap.set(hex, {
              hex,
              rgb: { r, g, b },
              hsl,
              count: 1
            });
          }
        }

        const colors = Array.from(colorMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 colors

        resolve(colors);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for color extraction'));
      };
    });
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/png')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PNG file.',
        variant: 'destructive',
      });
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    if (images.length >= 3) {
      toast({
        title: 'Maximum Limit Reached',
        description: 'You can upload up to 3 images.',
        variant: 'destructive',
      });
      return;
    }

    const originalUrl = URL.createObjectURL(uploadedFile);
    
    setIsLoading(true);

    try {
      const processedDataUrl = originalUrl; // No background removal, just use original URL

      const newImagePair: ImagePair = {
        id: `image-${Date.now()}`,
        original: originalUrl,
        processed: processedDataUrl
      };

      setImages(prevImages => {
        const updatedImages = [...prevImages, newImagePair];
        onPhotosChange(updatedImages.map(img => img.processed!).filter(Boolean) as string[]);
        return updatedImages;
      });
      setImageFileName(uploadedFile.name); // Set image file name

      toast({
        title: 'Success!',
        description: 'Image processed successfully.',
      });
    } catch (error) {
      console.error('Image processing error:', error);
      
      const newImagePair: ImagePair = {
        id: `image-${Date.now()}`,
        original: originalUrl,
        processed: null
      };

      setImages(prevImages => [...prevImages, newImagePair]);

      toast({
        title: 'Error',
        description: 'Failed to process image completely.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogoUpload = async (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      toast({
        title: 'Invalid Logo File',
        description: 'Please upload an image file for the logo.',
        variant: 'destructive',
      });
      return;
    }

    const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > MAX_LOGO_SIZE) {
      toast({
        title: 'Logo File Too Large',
        description: 'Please upload a logo smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const logoUrl = URL.createObjectURL(uploadedFile);
    onLogoChange(logoUrl); // Use onLogoChange prop
    setLogoFileName(uploadedFile.name); // Set logo file name

    try {
      setIsColorExtracting(true);
      const colors = await extractColorsFromImage(logoUrl);
      onExtractedColorsChange(colors); // Use onExtractedColorsChange prop

      toast({
        title: 'Colors Extracted',
        description: 'Successfully extracted colors from your logo.',
      });
    } catch (error) {
      toast({
        title: 'Color Extraction Failed',
        description: 'Could not extract colors from the logo.',
        variant: 'destructive',
      });
    } finally {
      setIsColorExtracting(false);
    }

    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeImage = (idToRemove: string) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(image => image.id !== idToRemove);
      onPhotosChange(updatedImages.map(img => img.processed!).filter(Boolean) as string[]);
      return updatedImages;
    });
    if (images.length === 1 && images[0].id === idToRemove) {
      setImageFileName(null); // Clear image file name if last image is removed
    }
  };

  const removeLogo = () => {
    onLogoChange(null); // Use onLogoChange prop
    onExtractedColorsChange([]); // Clear extracted colors via prop
    setLogoFileName(null); // Clear logo file name
  };

  // Removed: const handleGenerateAIImage = async () => { ... }

  return (
    <div className="space-y-4 p-4 border rounded-lg border-primary/20 shadow-modern-primary">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-bold tracking-tight text-primary mb-2">
          Upload PNG Images (Max 3) - No Background Removal
        </label>
        <p className="text-xs text-primary/60 mb-2">
          For testing: Upload PNG files with transparent backgrounds. No background removal processing.
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={(e) => {
              const uploadedFile = e.target.files?.[0];
              if (uploadedFile) {
                handleFileUpload(uploadedFile);
              }
            }}
            className="hidden" // Hide the default input
            id="image-upload"
          />
          <label 
            htmlFor="image-upload"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold 
                      ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
                      focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                      h-10 px-4 py-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer"
          >
            Choose File
          </label>
          <span className="text-sm text-primary/80">{imageFileName || "No file chosen"}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-4">
          <Lottie 
            animationData={gradientLoaderAnimation} 
            loop={true} 
            className="w-64 h-64"
          />
          <span className="mt-4 text-primary">Processing image...</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((imagePair) => (
            <div 
              key={imagePair.id} 
              className="relative group border border-primary/20 rounded-lg overflow-hidden"
            >
              <div className="w-full h-32 overflow-hidden bg-primary/5">
                <img
                  src={imagePair.original}
                  alt="Original"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeImage(imagePair.id)}
                  className="bg-primary text-white p-1 rounded-full hover:bg-primary/80"
                  title="Remove Image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Removed: AI Image Generation Section */}

      {/* Logo Upload Section */}
      <div className="mt-4">
        <label className="block text-sm font-bold tracking-tight text-primary mb-2">
          Upload Company Logo (Optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const uploadedFile = e.target.files?.[0];
              if (uploadedFile) {
                handleLogoUpload(uploadedFile);
              }
            }}
            className="hidden" // Hide the default input
            id="logo-upload"
          />
          <label 
            htmlFor="logo-upload"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold 
                      ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
                      focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                      h-10 px-4 py-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer"
          >
            Choose File
          </label>
          <span className="text-sm text-primary/80">{logoFileName || "No file chosen"}</span>
        </div>
      </div>

      {/* Logo Preview */}
      {logo && (
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative w-32 h-32 border border-primary/20 rounded-lg overflow-hidden shadow-modern-primary">
            <img
              src={logo}
              alt="Company Logo"
              className="w-full h-full object-contain p-2"
            />
            <button
              onClick={removeLogo}
              className="absolute top-1 right-1 bg-primary text-white p-1 rounded-full hover:bg-primary/80 transition-colors"
              title="Remove Logo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Color Extraction Loading */}
      {isColorExtracting && (
        <div className="flex items-center justify-center p-4">
          <Lottie 
            animationData={gradientLoaderAnimation} 
            loop={true} 
            className="w-32 h-32"
          />
          <span className="ml-4 text-primary">Extracting colors...</span>
        </div>
      )}

      {/* Removed: Theme Color Palette */}
    </div>
  );
}
