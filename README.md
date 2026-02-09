# AI Resume Analyzer with GenAI

A full-stack web application that analyzes resumes using AI, provides detailed feedback, and generates improved versions.

## Features

- 📄 **Resume Upload**: Support for PDF, DOC, DOCX, and TXT files
- 🎯 **ATS Score**: Calculate Applicant Tracking System compatibility score
- 🤖 **AI Feedback**: Get intelligent suggestions based on industry best practices
- 📊 **Detailed Analytics**: Comprehensive metrics and section-by-section analysis
- ✨ **Resume Improvement**: Generate optimized versions automatically
- 💾 **History Tracking**: Save and review past analyses
- 🎨 **Modern UI**: Beautiful, responsive design with animations

## Tech Stack

### Backend
- Node.js + Express
- SQLite database
- PDF/DOCX parsing (pdf-parse, mammoth)
- File upload handling (multer)

### Frontend
- HTML5
- CSS3 (Modern gradients, animations)
- Vanilla JavaScript
- Responsive design

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd C:\Users\ACER\.gemini\antigravity\scratch\resume-analyzer-genai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   copy .env.example .env
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## Usage

1. **Upload Resume**: Click "Choose File" and select your resume
2. **Analyze**: Click "Analyze Resume" to get instant feedback
3. **Review Results**: See your ATS score, strengths, issues, and recommendations
4. **Improve**: Click "Generate Improved Resume" for an optimized version
5. **Download**: Save your analysis report or improved resume

## Project Structure

```
resume-analyzer-genai/
├── public/
│   ├── css/
│   │   └── style.css          # Styles with modern design
│   ├── js/
│   │   └── app.js             # Frontend logic
│   └── index.html             # Main HTML file
├── services/
│   ├── resumeAnalyzer.js      # Resume parsing and analysis
│   └── aiService.js           # AI feedback generation
├── database/
│   └── db.js                  # SQLite database operations
├── uploads/                   # Uploaded resume files
├── server.js                  # Express server
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## API Endpoints

- `POST /api/upload` - Upload and analyze resume
- `GET /api/resumes` - Get all analyzed resumes
- `GET /api/resumes/:id` - Get specific resume
- `POST /api/improve/:id` - Generate improved resume
- `DELETE /api/resumes/:id` - Delete resume

## Features Explained

### ATS Score Calculation
The system analyzes:
- Essential sections (Contact, Summary, Experience, Education, Skills)
- Action verbs and keywords
- Quantifiable achievements
- Resume length and formatting

### AI Feedback
Provides:
- Overall assessment
- Section-specific recommendations
- Priority-based improvements (High/Medium/Low)
- Industry best practices

### Resume Improvement
Generates:
- Optimized structure
- Enhanced bullet points
- Better keyword usage
- ATS-friendly formatting

## Future Enhancements

- Integration with real GenAI APIs (Google Gemini, OpenAI)
- Job description matching
- Industry-specific templates
- Multi-language support
- PDF export for improved resumes
- Comparison with successful resumes

## License

MIT License

## Author

Built with ❤️ to help job seekers land their dream jobs
