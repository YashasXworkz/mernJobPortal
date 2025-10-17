const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/auth');

const router = express.Router();

// Cloudinary is configured globally in server.js
const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const documentUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents are allowed'), false);
    }
  }
});

router.post('/image', auth, imageUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'jobportal',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/document', auth, documentUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'jobportal/resumes',
          resource_type: 'raw',
          use_filename: true,
          unique_filename: false,
          public_id: `${req.file.originalname.replace(/\.[^/.]+$/, "")}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Use Cloudinary's fl_attachment parameter to set the download filename
    const baseUrl = result.secure_url;
    const downloadUrl = baseUrl.replace(
      '/upload/',
      `/upload/fl_attachment:${encodeURIComponent(req.file.originalname)}/`
    );
    
    res.json({
      message: 'Document uploaded successfully',
      url: baseUrl, // Original URL for viewing
      downloadUrl: downloadUrl, // URL with proper filename for downloading
      public_id: result.public_id,
      bytes: result.bytes,
      filename: req.file.originalname
    });
  } catch (error) {
    const message = error.message && error.message.includes('File size') ? error.message : 'Failed to upload document';
    res.status(500).json({ error: message });
  }
});

module.exports = router;
