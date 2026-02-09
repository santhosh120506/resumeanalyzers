const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const db = require('./database/db');
const resumeAnalyzer = require('./services/resumeAnalyzer');
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
        }
    }
});

// Routes

// Upload and analyze resume
app.post('/api/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Extract text from resume
        const resumeText = await resumeAnalyzer.extractText(filePath);

        // Analyze resume
        const analysis = await resumeAnalyzer.analyzeResume(resumeText);

        // Get AI feedback and suggestions
        const aiFeedback = await aiService.generateFeedback(resumeText, analysis);

        // Save to database
        const resumeId = await db.saveResume({
            fileName,
            filePath,
            resumeText,
            analysis,
            aiFeedback,
            uploadDate: new Date().toISOString()
        });

        res.json({
            success: true,
            resumeId,
            fileName,
            analysis,
            aiFeedback
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get resume history
app.get('/api/resumes', async (req, res) => {
    try {
        const resumes = await db.getAllResumes();
        res.json({ success: true, resumes });
    } catch (error) {
        console.error('Error fetching resumes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific resume
app.get('/api/resumes/:id', async (req, res) => {
    try {
        const resume = await db.getResumeById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        res.json({ success: true, resume });
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete resume
app.delete('/api/resumes/:id', async (req, res) => {
    try {
        const resume = await db.getResumeById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Delete file
        if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        // Delete from database
        await db.deleteResume(req.params.id);

        res.json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate improved resume
app.post('/api/improve/:id', async (req, res) => {
    try {
        const resume = await db.getResumeById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        const improvedResume = await aiService.generateImprovedResume(
            resume.resumeText,
            resume.analysis,
            resume.aiFeedback
        );

        // Save improved version
        await db.saveImprovedVersion(req.params.id, improvedResume);

        res.json({ success: true, improvedResume });
    } catch (error) {
        console.error('Error improving resume:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize database and start server
db.initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Resume Analyzer Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
