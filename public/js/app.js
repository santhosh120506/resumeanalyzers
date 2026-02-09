// API Base URL
const API_URL = 'http://localhost:3000/api';

// Global state
let currentResumeId = null;
let currentAnalysis = null;
let currentFeedback = null;
let improvedResumeData = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadHistory();
    setupNavigation();
});

// Event Listeners
function initializeEventListeners() {
    const fileInput = document.getElementById('resumeFile');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const improveBtn = document.getElementById('improveBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    fileInput.addEventListener('change', handleFileSelect);
    analyzeBtn.addEventListener('click', analyzeResume);
    improveBtn.addEventListener('click', generateImprovedResume);
    downloadBtn.addEventListener('click', downloadReport);
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Scroll to section
            const section = document.getElementById(target);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// File Selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameDisplay = document.getElementById('fileName');
    const analyzeBtn = document.getElementById('analyzeBtn');

    if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        fileNameDisplay.textContent = `${file.name} (${fileSize} MB)`;
        fileNameDisplay.style.display = 'block';
        analyzeBtn.style.display = 'inline-flex';
    } else {
        fileNameDisplay.style.display = 'none';
        analyzeBtn.style.display = 'none';
    }
}

// Analyze Resume
async function analyzeResume() {
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            currentResumeId = data.resumeId;
            currentAnalysis = data.analysis;
            currentFeedback = data.aiFeedback;

            displayResults(data.analysis, data.aiFeedback);
            loadHistory(); // Refresh history
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze resume. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display Results
function displayResults(analysis, feedback) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Animate score
    animateScore(analysis.score);

    // Display overall feedback
    document.getElementById('overallFeedback').textContent = feedback.overall;

    // Display metrics
    document.getElementById('wordCount').textContent = analysis.metrics.wordCount;
    document.getElementById('sectionsFound').textContent = `${analysis.metrics.sectionsFound}/7`;
    document.getElementById('keywordsFound').textContent = analysis.metrics.keywordsFound;
    document.getElementById('achievementsFound').textContent = analysis.metrics.quantifiableAchievements;

    // Display strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '';
    if (analysis.strengths.length > 0) {
        analysis.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
    } else {
        strengthsList.innerHTML = '<li>No specific strengths identified yet</li>';
    }

    // Display issues
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '';
    if (analysis.issues.length > 0) {
        analysis.issues.forEach(issue => {
            const li = document.createElement('li');
            li.textContent = issue;
            issuesList.appendChild(li);
        });
    } else {
        issuesList.innerHTML = '<li>No major issues found!</li>';
    }

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    feedback.recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <h4>
                ${rec.title}
                <span class="impact-badge impact-${rec.impact}">${rec.impact} impact</span>
            </h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(card);
    });

    // Display section feedback
    const sectionFeedback = document.getElementById('sectionFeedback');
    sectionFeedback.innerHTML = '';
    Object.entries(feedback.sections).forEach(([section, text]) => {
        const card = document.createElement('div');
        card.className = 'section-card';
        card.innerHTML = `
            <h4>${section}</h4>
            <p>${text}</p>
        `;
        sectionFeedback.appendChild(card);
    });
}

// Animate Score Circle
function animateScore(targetScore) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreCircle = document.getElementById('scoreCircle');
    const circumference = 2 * Math.PI * 90; // radius = 90

    let currentScore = 0;
    const duration = 2000; // 2 seconds
    const increment = targetScore / (duration / 16); // 60fps

    const animation = setInterval(() => {
        currentScore += increment;

        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }

        scoreValue.textContent = Math.round(currentScore);

        // Update circle
        const offset = circumference - (currentScore / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;
    }, 16);
}

// Generate Improved Resume
async function generateImprovedResume() {
    if (!currentResumeId) {
        alert('No resume to improve');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/improve/${currentResumeId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            improvedResumeData = data.improvedResume;
            showImprovedModal(data.improvedResume);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate improved resume. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Show Improved Modal
function showImprovedModal(improvedData) {
    const modal = document.getElementById('improvedModal');
    const improvedResume = document.getElementById('improvedResume');
    const changesList = document.getElementById('changesList');

    improvedResume.textContent = improvedData.fullText;

    changesList.innerHTML = '';
    improvedData.changes.forEach(change => {
        const li = document.createElement('li');
        li.textContent = change;
        changesList.appendChild(li);
    });

    modal.style.display = 'block';
}

// Close Improved Modal
function closeImprovedModal() {
    const modal = document.getElementById('improvedModal');
    modal.style.display = 'none';
}

// Download Improved Resume
function downloadImprovedResume() {
    if (!improvedResumeData) {
        alert('No improved resume to download');
        return;
    }

    const blob = new Blob([improvedResumeData.fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'improved-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Download Report
function downloadReport() {
    if (!currentAnalysis || !currentFeedback) {
        alert('No analysis to download');
        return;
    }

    const report = generateReportText(currentAnalysis, currentFeedback);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate Report Text
function generateReportText(analysis, feedback) {
    let report = `RESUME ANALYSIS REPORT
${'='.repeat(50)}

ATS SCORE: ${analysis.score}/100

OVERALL FEEDBACK:
${feedback.overall}

METRICS:
- Word Count: ${analysis.metrics.wordCount}
- Sections Found: ${analysis.metrics.sectionsFound}/7
- Keywords Found: ${analysis.metrics.keywordsFound}
- Quantifiable Achievements: ${analysis.metrics.quantifiableAchievements}

STRENGTHS:
${analysis.strengths.map(s => `✓ ${s}`).join('\n') || 'None identified'}

ISSUES TO FIX:
${analysis.issues.map(i => `✗ ${i}`).join('\n') || 'None identified'}

RECOMMENDATIONS:
${feedback.recommendations.map((r, i) => `${i + 1}. ${r.title} (${r.impact.toUpperCase()} IMPACT)\n   ${r.description}`).join('\n\n')}

SECTION-BY-SECTION FEEDBACK:
${Object.entries(feedback.sections).map(([section, text]) => `${section.toUpperCase()}:\n${text}`).join('\n\n')}

${'='.repeat(50)}
Generated by AI Resume Analyzer
`;

    return report;
}

// Load History
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/resumes`);
        const data = await response.json();

        if (data.success) {
            displayHistory(data.resumes);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Display History
function displayHistory(resumes) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (resumes.length === 0) {
        historyList.innerHTML = '<p style="color: white; text-align: center;">No resumes analyzed yet</p>';
        return;
    }

    resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.onclick = () => viewResumeDetails(resume.id);

        const date = new Date(resume.uploadDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <h4>${resume.fileName}</h4>
            <div class="date">${date}</div>
            <div class="score">${resume.analysis.score}/100</div>
        `;
        historyList.appendChild(card);
    });
}

// View Resume Details
async function viewResumeDetails(id) {
    try {
        const response = await fetch(`${API_URL}/resumes/${id}`);
        const data = await response.json();

        if (data.success) {
            currentResumeId = data.resume.id;
            currentAnalysis = data.resume.analysis;
            currentFeedback = data.resume.aiFeedback;
            displayResults(data.resume.analysis, data.resume.aiFeedback);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load resume details');
    }
}

// Reset Analysis
function resetAnalysis() {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'none';

    const fileInput = document.getElementById('resumeFile');
    fileInput.value = '';

    const fileNameDisplay = document.getElementById('fileName');
    fileNameDisplay.style.display = 'none';

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.style.display = 'none';

    currentResumeId = null;
    currentAnalysis = null;
    currentFeedback = null;
    improvedResumeData = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show/Hide Loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('improvedModal');
    if (event.target === modal) {
        closeImprovedModal();
    }
}
