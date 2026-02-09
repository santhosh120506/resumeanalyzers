// AI Service for generating feedback and improvements
// This is a rule-based AI service. You can integrate with actual GenAI APIs like Google Gemini or OpenAI

async function generateFeedback(resumeText, analysis) {
    const feedback = {
        overall: '',
        sections: {},
        recommendations: [],
        priority: {
            high: [],
            medium: [],
            low: []
        }
    };

    // Generate overall feedback based on score
    if (analysis.score >= 80) {
        feedback.overall = 'Excellent! Your resume is well-structured and ATS-friendly. Minor improvements can make it even stronger.';
    } else if (analysis.score >= 60) {
        feedback.overall = 'Good foundation! Your resume has solid elements but needs some improvements to be more competitive.';
    } else if (analysis.score >= 40) {
        feedback.overall = 'Needs improvement. Your resume requires significant changes to pass ATS systems and attract recruiters.';
    } else {
        feedback.overall = 'Critical issues detected. Your resume needs major restructuring to be effective.';
    }

    // Section-specific feedback
    if (!analysis.sections.contact) {
        feedback.sections.contact = 'Add a clear contact section with your name, email, phone, and LinkedIn profile.';
        feedback.priority.high.push('Add contact information');
    }

    if (!analysis.sections.summary) {
        feedback.sections.summary = 'Include a professional summary (2-3 sentences) highlighting your key strengths and career goals.';
        feedback.priority.medium.push('Add professional summary');
    }

    if (!analysis.sections.experience) {
        feedback.sections.experience = 'Add your work experience with job titles, companies, dates, and bullet points describing achievements.';
        feedback.priority.high.push('Add work experience');
    } else {
        feedback.sections.experience = 'Use bullet points starting with action verbs. Include quantifiable achievements (e.g., "Increased sales by 25%").';
    }

    if (!analysis.sections.education) {
        feedback.sections.education = 'Add your educational background including degree, institution, and graduation year.';
        feedback.priority.high.push('Add education section');
    }

    if (!analysis.sections.skills) {
        feedback.sections.skills = 'Create a skills section with relevant technical and soft skills for your target role.';
        feedback.priority.high.push('Add skills section');
    } else {
        feedback.sections.skills = 'Organize skills by category (e.g., Technical Skills, Languages, Tools) for better readability.';
    }

    if (!analysis.sections.projects) {
        feedback.sections.projects = 'Consider adding a projects section to showcase your practical experience and portfolio.';
        feedback.priority.low.push('Add projects section');
    }

    // Generate recommendations
    if (analysis.metrics.quantifiableAchievements < 5) {
        feedback.recommendations.push({
            title: 'Add Quantifiable Achievements',
            description: 'Include specific numbers, percentages, or metrics to demonstrate your impact. For example: "Reduced processing time by 30%" or "Managed a team of 5 developers".',
            impact: 'high'
        });
        feedback.priority.high.push('Add quantifiable metrics');
    }

    if (analysis.metrics.keywordsFound < 8) {
        feedback.recommendations.push({
            title: 'Use More Action Verbs',
            description: 'Start bullet points with strong action verbs like: achieved, developed, implemented, led, optimized, designed, created, improved.',
            impact: 'high'
        });
        feedback.priority.medium.push('Use stronger action verbs');
    }

    if (analysis.metrics.wordCount < 300) {
        feedback.recommendations.push({
            title: 'Expand Your Resume',
            description: 'Your resume is too brief. Add more details about your responsibilities, achievements, and skills. Aim for 400-600 words.',
            impact: 'high'
        });
    } else if (analysis.metrics.wordCount > 800) {
        feedback.recommendations.push({
            title: 'Condense Your Resume',
            description: 'Your resume is too lengthy. Focus on the most relevant and impactful information. Aim for 400-600 words.',
            impact: 'medium'
        });
    }

    // ATS optimization tips
    feedback.recommendations.push({
        title: 'ATS Optimization',
        description: 'Use standard section headings (Experience, Education, Skills). Avoid tables, images, or complex formatting that ATS systems cannot parse.',
        impact: 'high'
    });

    feedback.recommendations.push({
        title: 'Tailor to Job Description',
        description: 'Customize your resume for each job application by including relevant keywords from the job description.',
        impact: 'high'
    });

    feedback.recommendations.push({
        title: 'Use Professional Format',
        description: 'Use a clean, professional font (Arial, Calibri, or Times New Roman). Maintain consistent formatting throughout.',
        impact: 'medium'
    });

    return feedback;
}

async function generateImprovedResume(resumeText, analysis, feedback) {
    // This is a template-based improvement generator
    // In production, you would integrate with actual GenAI APIs

    let improved = {
        sections: {},
        fullText: '',
        changes: []
    };

    // Generate improved sections based on feedback
    improved.sections.header = `[YOUR NAME]
Email: your.email@example.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/yourprofile
Location: City, State`;

    improved.sections.summary = `PROFESSIONAL SUMMARY
Results-driven professional with [X] years of experience in [your field]. Proven track record of [key achievement]. Skilled in [top 3-4 skills]. Seeking to leverage expertise in [target role] to drive [company goal].`;

    improved.sections.experience = `PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [Start Date] - [End Date]
• Developed and implemented [specific project/initiative] that resulted in [quantifiable outcome]
• Managed [team size/budget/resources] to achieve [specific goal], improving [metric] by [percentage]
• Collaborated with cross-functional teams to [specific achievement]
• Optimized [process/system] leading to [quantifiable improvement]

[Previous Job Title] | [Previous Company] | [Start Date] - [End Date]
• Led [specific initiative] resulting in [measurable impact]
• Increased [metric] by [percentage] through [specific action]
• Designed and executed [project] that [specific outcome]`;

    improved.sections.education = `EDUCATION

[Degree] in [Field of Study]
[University Name] | [Graduation Year]
• GPA: [if 3.5+] | Relevant Coursework: [list 3-4 relevant courses]
• Honors/Awards: [if applicable]`;

    improved.sections.skills = `TECHNICAL SKILLS

• Programming Languages: [list relevant languages]
• Frameworks & Tools: [list relevant frameworks and tools]
• Soft Skills: Leadership, Communication, Problem-Solving, Team Collaboration
• Certifications: [list any relevant certifications]`;

    improved.sections.projects = `PROJECTS

[Project Name] | [Technologies Used]
• Developed [description] that [impact/outcome]
• Implemented [specific feature] improving [metric] by [percentage]
• Technologies: [list technologies used]`;

    // Combine sections
    improved.fullText = `${improved.sections.header}

${improved.sections.summary}

${improved.sections.experience}

${improved.sections.education}

${improved.sections.skills}

${improved.sections.projects}`;

    // Document changes
    improved.changes = [
        'Added professional header with contact information',
        'Created compelling professional summary',
        'Restructured experience with action verbs and quantifiable achievements',
        'Organized skills by category',
        'Added projects section to showcase practical experience',
        'Optimized formatting for ATS compatibility'
    ];

    return improved;
}

module.exports = {
    generateFeedback,
    generateImprovedResume
};
