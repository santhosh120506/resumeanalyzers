const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'resumes.db');
let db;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Resumes table
            db.run(`
                CREATE TABLE IF NOT EXISTS resumes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fileName TEXT NOT NULL,
                    filePath TEXT NOT NULL,
                    resumeText TEXT NOT NULL,
                    analysis TEXT NOT NULL,
                    aiFeedback TEXT NOT NULL,
                    uploadDate TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
            });

            // Improved versions table
            db.run(`
                CREATE TABLE IF NOT EXISTS improved_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    resumeId INTEGER NOT NULL,
                    improvedText TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Database tables created');
                    resolve();
                }
            });
        });
    });
}

// Save resume
function saveResume(resumeData) {
    return new Promise((resolve, reject) => {
        const { fileName, filePath, resumeText, analysis, aiFeedback, uploadDate } = resumeData;

        const sql = `
            INSERT INTO resumes (fileName, filePath, resumeText, analysis, aiFeedback, uploadDate)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [
            fileName,
            filePath,
            resumeText,
            JSON.stringify(analysis),
            JSON.stringify(aiFeedback),
            uploadDate
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Get all resumes
function getAllResumes() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, fileName, uploadDate, analysis, aiFeedback, createdAt
            FROM resumes
            ORDER BY createdAt DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const resumes = rows.map(row => ({
                    ...row,
                    analysis: JSON.parse(row.analysis),
                    aiFeedback: JSON.parse(row.aiFeedback)
                }));
                resolve(resumes);
            }
        });
    });
}

// Get resume by ID
function getResumeById(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM resumes WHERE id = ?`;

        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null);
            } else {
                resolve({
                    ...row,
                    analysis: JSON.parse(row.analysis),
                    aiFeedback: JSON.parse(row.aiFeedback)
                });
            }
        });
    });
}

// Delete resume
function deleteResume(id) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM resumes WHERE id = ?`;

        db.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Save improved version
function saveImprovedVersion(resumeId, improvedText) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO improved_versions (resumeId, improvedText)
            VALUES (?, ?)
        `;

        db.run(sql, [resumeId, improvedText], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Get improved versions
function getImprovedVersions(resumeId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM improved_versions
            WHERE resumeId = ?
            ORDER BY createdAt DESC
        `;

        db.all(sql, [resumeId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    initDatabase,
    saveResume,
    getAllResumes,
    getResumeById,
    deleteResume,
    saveImprovedVersion,
    getImprovedVersions
};
