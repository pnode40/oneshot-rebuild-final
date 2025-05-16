import { Router } from 'express';
import { db } from '../db/client';
import { uploadProfilePhoto } from '../utils/fileUpload';
import path from 'path';
import fs from 'fs';

const router = Router();

// GET /api/debug/health - Check server health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET /api/debug/db - Test database connection
router.get('/db', async (req, res) => {
  try {
    const result = await db.query.profiles.findMany();
    res.json({ 
      status: 'ok', 
      profiles: result.length,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: String(error),
      details: 'Database connection failed'
    });
  }
});

// POST /api/debug/upload-test - Test file upload functionality
router.post('/upload-test', (req, res) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: 'File upload failed',
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    res.json({
      status: 'ok',
      message: 'File uploaded successfully',
      file: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      }
    });
  });
});

// GET /api/debug/uploads - List all uploaded files
router.get('/uploads', (req, res) => {
  try {
    const photoDir = path.join(process.cwd(), 'uploads', 'profiles', 'photos');
    const transcriptDir = path.join(process.cwd(), 'uploads', 'profiles', 'transcripts');
    
    const photos = fs.existsSync(photoDir) 
      ? fs.readdirSync(photoDir).filter(file => !file.startsWith('.'))
      : [];
    
    const transcripts = fs.existsSync(transcriptDir)
      ? fs.readdirSync(transcriptDir).filter(file => !file.startsWith('.'))
      : [];
    
    res.json({
      status: 'ok',
      uploads: {
        photos,
        transcripts,
        photoCount: photos.length,
        transcriptCount: transcripts.length
      }
    });
  } catch (error) {
    console.error('Error listing uploads:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list uploads',
      error: String(error)
    });
  }
});

export default router; 