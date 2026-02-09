const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract text from different file formats
async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt') {
            return await fs.readFile(filePath, 'utf-8');
        } else {
            throw new Error('Unsupported file format');
        }
    } catch (error) {
        throw new Error(`Failed to extract text: ${error.message}`);
    }
}

// Analyze resume content
function analyzeResume(resumeText) {
    const analysis = {
        score: 0,
        sections: {},
        keywords: [],
        issues: [],
        strengths: [],
        metrics: {}
    };

    // Check for essential sections
    const sections = {
        contact: /contact|email|phone|address|linkedin/i,
        summary: /summary|objective|profile|about/i,
        experience: /experience|work history|employment/i,
        education: /education|degree|university|college/i,
        skills: /skills|technical skills|competencies/i,
        projects: /projects|portfolio/i,
        certifications: /certifications|certificates|licenses/i
    };

    let sectionsFound = 0;
    for (const [section, regex] of Object.entries(sections)) {
        if (regex.test(resumeText)) {
            analysis.sections[section] = true;
            sectionsFound++;
        } else {
            analysis.sections[section] = false;
        }
    }

    // Calculate section score (40% of total)
    const sectionScore = (sectionsFound / Object.keys(sections).length) * 40;

    // Check for keywords (ATS-friendly terms)
    const commonKeywords = [
        'managed', 'developed', 'created', 'implemented', 'designed',
        'led', 'improved', 'increased', 'reduced', 'achieved',
        'collaborated', 'coordinated', 'analyzed', 'optimized'
    ];

    let keywordsFound = 0;
    commonKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = resumeText.match(regex);
        if (matches) {
            analysis.keywords.push({ keyword, count: matches.length });
            keywordsFound++;
        }
    });

    // Calculate keyword score (30% of total)
    const keywordScore = (keywordsFound / commonKeywords.length) * 30;

    // Check for quantifiable achievements
    const numberPattern = /\d+%|\d+\+|increased by \d+|reduced by \d+|\$\d+/gi;
    const quantifiableAchievements = resumeText.match(numberPattern) || [];
    const achievementScore = Math.min((quantifiableAchievements.length / 5) * 15, 15);

    // Check formatting and length
    const wordCount = resumeText.split(/\s+/).length;
    let formatScore = 0;

    if (wordCount >= 300 && wordCount <= 800) {
        formatScore = 15;
        analysis.strengths.push('Appropriate resume length');
    } else if (wordCount < 300) {
        analysis.issues.push('Resume is too short - add more details');
        formatScore = 5;
    } else {
        analysis.issues.push('Resume is too long - consider condensing');
        formatScore = 10;
    }

    // Identify issues
    if (!analysis.sections.contact) {
        analysis.issues.push('Missing contact information section');
    }
    if (!analysis.sections.experience) {
        analysis.issues.push('Missing work experience section');
    }
    if (!analysis.sections.education) {
        analysis.issues.push('Missing education section');
    }
    if (!analysis.sections.skills) {
        analysis.issues.push('Missing skills section');
    }
    if (quantifiableAchievements.length < 3) {
        analysis.issues.push('Add more quantifiable achievements (numbers, percentages, metrics)');
    }
    if (keywordsFound < 5) {
        analysis.issues.push('Use more action verbs and industry keywords');
    }

    // Identify strengths
    if (analysis.sections.projects) {
        analysis.strengths.push('Includes projects section');
    }
    if (analysis.sections.certifications) {
        analysis.strengths.push('Includes certifications');
    }
    if (quantifiableAchievements.length >= 5) {
        analysis.strengths.push('Good use of quantifiable achievements');
    }
    if (keywordsFound >= 8) {
        analysis.strengths.push('Strong use of action verbs and keywords');
    }

    // Calculate total score
    analysis.score = Math.round(sectionScore + keywordScore + achievementScore + formatScore);

    // Add metrics
    analysis.metrics = {
        wordCount,
        sectionsFound,
        keywordsFound,
        quantifiableAchievements: quantifiableAchievements.length
    };

    return analysis;
}

module.exports = {
    extractText,
    analyzeResume
};
