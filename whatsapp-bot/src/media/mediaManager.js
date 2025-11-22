/**
 * Media Manager
 * Handles file uploads, optimization, and storage
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Logger = require('../config/logger');

const logger = new Logger('MediaManager');

class MediaManager {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.thumbDir = path.join(this.uploadDir, 'thumbnails');
    this.ensureDirectories();
  }

  /**
   * Ensure upload directories exist
   */
  ensureDirectories() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.thumbDir)) {
      fs.mkdirSync(this.thumbDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file
   */
  async saveFile(fileBuffer, fileName, mimeType) {
    try {
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      const ext = path.extname(fileName);
      const newFileName = `${fileHash}${ext}`;
      const filePath = path.join(this.uploadDir, newFileName);

      // Save file
      fs.writeFileSync(filePath, fileBuffer);

      const mediaRecord = {
        id: fileHash,
        original_name: fileName,
        file_name: newFileName,
        mime_type: mimeType,
        size: fileBuffer.length,
        hash: fileHash,
        url: `/media/${fileHash}${ext}`,
        created_at: new Date().toISOString(),
        path: filePath,
      };

      logger.success(`File saved: ${newFileName}`);
      return mediaRecord;
    } catch (error) {
      logger.error('File save error', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  getFile(fileId) {
    try {
      // Find file starting with this ID
      const files = fs.readdirSync(this.uploadDir);
      const file = files.find((f) => f.startsWith(fileId));

      if (!file) {
        return null;
      }

      const filePath = path.join(this.uploadDir, file);
      const stat = fs.statSync(filePath);

      return {
        path: filePath,
        size: stat.size,
        name: file,
      };
    } catch (error) {
      logger.error('Get file error', error);
      return null;
    }
  }

  /**
   * Delete file by ID
   */
  deleteFile(fileId) {
    try {
      const file = this.getFile(fileId);
      if (file) {
        fs.unlinkSync(file.path);
        logger.success(`File deleted: ${fileId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Delete file error', error);
      return false;
    }
  }

  /**
   * Generate thumbnail (will use Sharp in production)
   * For now, just copy the file
   */
  async generateThumbnail(fileId, fileBuffer, mimeType) {
    try {
      const thumbFileName = `thumb_${fileId}.jpg`;
      const thumbPath = path.join(this.thumbDir, thumbFileName);

      // Store original for now - Sharp would resize this
      fs.writeFileSync(thumbPath, fileBuffer);

      return {
        id: `thumb_${fileId}`,
        url: `/media/thumbnails/${thumbFileName}`,
        path: thumbPath,
      };
    } catch (error) {
      logger.error('Thumbnail generation error', error);
      return null;
    }
  }

  /**
   * Validate image file
   */
  validateImage(mimeType, size) {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const errors = [];

    if (!validMimes.includes(mimeType)) {
      errors.push('Invalid image type. Allowed: JPEG, PNG, WebP');
    }

    if (size > maxSize) {
      errors.push('Image too large. Maximum: 5MB');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create media record in cache (for now)
   * In production, store in DB
   */
  async createMediaRecord(fileBuffer, fileName, mimeType, ownerId) {
    try {
      // Validate
      const validation = this.validateImage(mimeType, fileBuffer.length);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save file
      const fileRecord = await this.saveFile(fileBuffer, fileName, mimeType);

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(fileRecord.id, fileBuffer, mimeType);

      return {
        ...fileRecord,
        owner_id: ownerId,
        thumbnail: thumbnail?.url,
        status: 'ready',
      };
    } catch (error) {
      logger.error('Create media record error', error);
      throw error;
    }
  }
}

module.exports = new MediaManager();
