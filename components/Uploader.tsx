'use client';
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import Lottie from 'lottie-react';
import gradientLoaderAnimation from '@/src/theme/gradient loader 01.json';
import { X, Upload } from 'lucide-react';

// Define interfaces for image storage
interface ImagePair {
  id: string;
  original: string;
  processed: string | null;
}

export function Uploader() {
  const [images, setImages] = useState<ImagePair[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const removeBackground = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
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

        for (let i = 0; i < data.length; i += 4) {
          const brightness = 
            (data[i] + data[i + 1] + data[i + 2]) / 3;

          // Make very light or very dark pixels more transparent
          if (brightness > 240 || brightness < 15) {
            data[i + 3] = 0; // Set alpha to 0 (fully transparent)
          }
        }

        ctx.putImageData(imageData, 0, 0);

        const processedDataUrl = canvas.toDataURL('image/png');
        resolve(processedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };

  const handleFileUpload = async (uploadedFile: File) => {
    // Validate file type and size
    if (!uploadedFile.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Optional: Add file size check
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    // Limit to 3 images
    if (images.length >= 3) {
      toast({
        title: 'Maximum Limit Reached',
        description: 'You can upload up to 3 images.',
        variant: 'destructive',
      });
      return;
    }

    // Store original image
    const originalUrl = URL.createObjectURL(uploadedFile);
    
    // Start loading
    setIsLoading(true);

    try {
      // Remove background
      const processedDataUrl = await removeBackground(uploadedFile);

      // Create a new image pair
      const newImagePair: ImagePair = {
        id: `image-${Date.now()}`, // Unique identifier
        original: originalUrl,
        processed: processedDataUrl
      };

      // Add to images array
      setImages(prevImages => [...prevImages, newImagePair]);

      toast({
        title: 'Success!',
        description: 'Image processed successfully.',
      });
    } catch (error) {
      console.error('Image processing error:', error);
      
      // If processing fails, still add the original image
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
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogoUpload = (uploadedFile: File) => {
    // Validate file type and size
    if (!uploadedFile.type.startsWith('image/')) {
      toast({
        title: 'Invalid Logo File',
        description: 'Please upload an image file for the logo.',
        variant: 'destructive',
      });
      return;
    }

    // Optional: Add file size check
    const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > MAX_LOGO_SIZE) {
      toast({
        title: 'Logo File Too Large',
        description: 'Please upload a logo smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Create URL for the logo
    const logoUrl = URL.createObjectURL(uploadedFile);
    setLogo(logoUrl);

    // Reset logo input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const removeImage = (idToRemove: string) => {
    setImages(prevImages => 
      prevImages.filter(image => image.id !== idToRemove)
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Images (Max 3)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const uploadedFile = e.target.files?.[0];
            if (uploadedFile) {
              handleFileUpload(uploadedFile);
            }
          }}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-4">
          <Lottie 
            animationData={gradientLoaderAnimation} 
            loop={true} 
            className="w-64 h-64"
          />
          <span className="mt-4 text-gray-600">Processing image...</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((imagePair) => (
            <div 
              key={imagePair.id} 
              className="relative group border rounded-lg overflow-hidden"
            >
              <div className="w-full h-32 overflow-hidden">
                <img
                  src={imagePair.original}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeImage(imagePair.id)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  title="Remove Image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logo Upload Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Company Logo (Optional)
        </label>
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
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Logo Preview */}
      {logo && (
        <div className="mt-4 relative w-32 h-32 border rounded-lg overflow-hidden">
          <img
            src={logo}
            alt="Company Logo"
            className="w-full h-full object-contain"
          />
          <button
            onClick={removeLogo}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            title="Remove Logo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
