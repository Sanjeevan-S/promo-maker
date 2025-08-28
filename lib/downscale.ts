export async function downscaleImage(file: File, maxDimension = 3000): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      let { width, height } = img

      // Calculate new dimensions if needed
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }

    img.src = URL.createObjectURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 8 * 1024 * 1024 // 8MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a valid image file (JPEG, PNG, or WebP)" }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image file is too large. Maximum size is 8MB." }
  }

  return { valid: true }
}
