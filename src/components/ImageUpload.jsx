import { useState, useRef } from 'react'
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa'

const ImageUpload = ({ 
  value, 
  onChange, 
  placeholder = "Upload image", 
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = ""
}) => {
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Reset error
    setError('')

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target.result
        setPreview(dataUrl)
        onChange(dataUrl) // For now, we'll use data URLs. In production, you'd upload to a server
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to process image')
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (event) => {
    const url = event.target.value
    setPreview(url)
    onChange(url)
    setError('')
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-24 object-cover rounded-lg border border-gray-300"
            onError={() => setError('Invalid image URL')}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="flex flex-col gap-2">
        {/* File Upload */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>
        </div>

        {/* URL Input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">or</span>
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="Enter image URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <FaImage className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Upload an image file or enter a URL. Max size: {Math.round(maxSize / (1024 * 1024))}MB
      </p>
    </div>
  )
}

export default ImageUpload