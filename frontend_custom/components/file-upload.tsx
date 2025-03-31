"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, Paperclip, Image, Music, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type MessageAttachment, mockUploadFile } from "@/lib/supabase"

interface FileUploadProps {
  onFileUpload: (attachment: MessageAttachment) => void
  onCancel: () => void
}

export function FileUpload({ onFileUpload, onCancel }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit")
      return
    }

    // Check file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase() || ""
    const allowedExtensions = ["jpg", "jpeg", "png", "mp3", "wav", "pdf", "docx"]

    if (!allowedExtensions.includes(fileExtension)) {
      setError("Unsupported file type. Please upload jpg, png, mp3, wav, pdf, or docx files.")
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const getFileType = (file: File): "image" | "audio" | "document" => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("audio/")) return "audio"
    return "document"
  }

  const getFileIcon = (file: File) => {
    const type = getFileType(file)

    switch (type) {
      case "image":
        return <Image className="h-6 w-6 text-primary" />
      case "audio":
        return <Music className="h-6 w-6 text-accent" />
      case "document":
        return <File className="h-6 w-6 text-secondary" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress > 90 ? 90 : newProgress
      })
    }, 300)

    try {
      const { url, error } = await mockUploadFile(file)

      if (error) {
        setError(error)
        return
      }

      // Complete progress
      setUploadProgress(100)

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

      const attachment: MessageAttachment = {
        id: Date.now().toString(),
        url,
        type: getFileType(file),
        name: file.name,
        size: file.size,
        fileExtension,
      }

      onFileUpload(attachment)
    } catch (err) {
      setError("Failed to upload file")
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/30 animate-slide-in-bottom">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Upload File</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.mp3,.wav,.pdf,.docx"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Paperclip className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, MP3, WAV, PDF, DOCX (Max 10MB)</p>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <div className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded-full">
                <Image className="h-3 w-3" /> Images
              </div>
              <div className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded-full">
                <Music className="h-3 w-3" /> Audio
              </div>
              <div className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded-full">
                <File className="h-3 w-3" /> Documents
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
            {getFileIcon(file)}
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {preview && (
            <div className="file-upload-preview">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading} className="relative overflow-hidden">
              {isUploading ? (
                <span className="flex items-center">
                  <span className="animate-pulse">Uploading...</span>
                </span>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

