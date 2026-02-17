import React, { useState, useRef, useEffect } from 'react';
import { 
  FaCloudUploadAlt, 
  FaCamera, 
  FaTrash, 
  FaCheck,
  FaImage,
  FaInfoCircle,
  FaUserCircle,
  FaEdit
} from "react-icons/fa";
import '../style/ImageUploader.css';

const ImageUploader = ({ 
  onImageSelect, 
  initialImage = null,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  aspectRatio = { width: 1, height: 1 }, 
  minWidth = 200,
  minHeight = 200,
  maxWidth = 5000,
  maxHeight = 5000,
  circular = true 
}) => {
  const [image, setImage] = useState(initialImage);
  const [preview, setPreview] = useState(initialImage);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Validate image file
  const validateImage = (file) => {
    const newErrors = {};
    
    if (!allowedTypes.includes(file.type)) {
      newErrors.type = `Only ${allowedTypes.map(t => t.split('/')[1]).join(', ')} images are supported`;
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      newErrors.size = `Image size should be less than ${maxSizeMB}MB (Current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    
    return newErrors;
  };

  // Get image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Validate image dimensions
  const validateDimensions = (width, height) => {
    const newErrors = {};
    
    if (width < minWidth || height < minHeight) {
      newErrors.dimensions = `Image must be at least ${minWidth}x${minHeight} pixels (Current: ${width}x${height})`;
    }
    
    if (width > maxWidth || height > maxHeight) {
      newErrors.dimensions = `Image must be less than ${maxWidth}x${maxHeight} pixels (Current: ${width}x${height})`;
    }
    
    if (aspectRatio) {
      const expectedRatio = aspectRatio.width / aspectRatio.height;
      const actualRatio = width / height;
      const ratioTolerance = 0.15;
      
      if (Math.abs(actualRatio - expectedRatio) > ratioTolerance) {
        newErrors.aspectRatio = `For best results, use a ${aspectRatio.width}:${aspectRatio.height} image (square recommended)`;
      }
    }
    
    return newErrors;
  };

  // Process and crop image for profile picture
  const processImage = async (file, width, height) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // For profile picture, we want a centered square crop
        const size = Math.min(width, height);
        const sourceX = (width - size) / 2;
        const sourceY = (height - size) / 2;
        
        // Set canvas to desired size (400x400 is good for profile)
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw circular clip if needed
        if (circular) {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        }
        
        // Draw image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          sourceX, sourceY, size, size,
          0, 0, canvas.width, canvas.height
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          const processedFile = new File([blob], 'profile.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(processedFile);
        }, 'image/jpeg', 0.9); // High quality JPEG
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setErrors({});
    setIsProcessing(true);
    
    try {
      // Basic validation
      const basicErrors = validateImage(file);
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        setIsProcessing(false);
        return;
      }
      
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Validate dimensions (warnings, not errors for profile)
      const dimensionErrors = validateDimensions(dimensions.width, dimensions.height);
      
      // Process image for profile picture
      let finalFile = file;
      if (circular || aspectRatio) {
        finalFile = await processImage(file, dimensions.width, dimensions.height);
      }
      
      // Create preview
      const previewUrl = URL.createObjectURL(finalFile);
      setPreview(previewUrl);
      setImage(finalFile);
      
      // Show success animation
      setUploadSuccess(true);
      
      // Notify parent component
      if (onImageSelect) {
        onImageSelect(finalFile, previewUrl);
      }
      
      // Set dimension warnings if any (but don't block upload)
      if (Object.keys(dimensionErrors).length > 0) {
        setErrors(dimensionErrors);
      }
      
    } catch (error) {
      setErrors({ processing: 'Failed to process image. Please try another.' });
      console.error('Image processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setErrors({ type: 'Please drop a valid image file' });
    }
  };

  // Remove image
  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setImage(null);
    setErrors({});
    setUploadSuccess(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImageSelect) {
      onImageSelect(null, null);
    }
  };

  // Trigger file input
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Get file size in MB
  const getFileSizeMB = (file) => {
    return file ? (file.size / 1024 / 1024).toFixed(2) : 0;
  };

  return (
    <div className="image-uploader">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        style={{ display: 'none' }}
      />
      
      {!preview ? (
        <div
          className={`upload-area ${circular ? 'circular' : ''} ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="upload-content">
            {isDragging ? (
              <>
                <FaCamera className="upload-icon" />
                <p className="upload-text">Drop your photo here</p>
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="upload-icon" />
                <p className="upload-text">Upload Profile Picture</p>
                <p className="upload-hint">
                  Click or drag to upload
                </p>
                <p className="upload-hint">
                  {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} • Max {maxSizeMB}MB
                </p>
                <p className="upload-hint" style={{ marginTop: '8px', color: 'var(--primary-purple-light)' }}>
                  <FaInfoCircle /> Square image recommended (400x400px)
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="profile-upload-preview">
            <div className="profile-image-container">
              <img
                src={preview}
                alt="Profile preview"
                className="profile-preview-image"
              />
              <div className="profile-image-overlay" onClick={handleButtonClick}>
                <FaEdit />
              </div>
              {uploadSuccess && (
                <div className="upload-success circular">
                  <div className="success-icon">
                    <FaCheck />
                  </div>
                </div>
              )}
            </div>
            
            {image && (
              <div className="image-info">
                <FaImage />
                <span>{image.name || 'profile.jpg'}</span>
                <span className="separator">•</span>
                <span>{getFileSizeMB(image)} MB</span>
              </div>
            )}
            
            <button
              type="button"
              className="remove-button"
              onClick={handleRemove}
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              <FaTrash /> Remove Photo
            </button>
            
            <div className="recommendation-badge">
              <FaCheck /> Perfect for your profile!
            </div>
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="upload-loading">
          <div className="loading-spinner-small"></div>
          <span className="loading-text">Processing image...</span>
        </div>
      )}
      
      {Object.keys(errors).length > 0 && !isProcessing && (
        <div className="error-messages">
          {Object.values(errors).map((error, index) => (
            <p key={index} className="error-text">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;