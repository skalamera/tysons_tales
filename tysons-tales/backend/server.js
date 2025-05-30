const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, '../database/tysons_tales.db'));

// Create tables
db.serialize(() => {
    // Characters table
    db.run(`CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    role TEXT NOT NULL,
    personalities TEXT,
    favorite_color TEXT,
    favorite_animal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Story progress table
    db.run(`CREATE TABLE IF NOT EXISTS story_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    character_id TEXT,
    story_theme TEXT,
    current_node_id TEXT,
    choices_made TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Import story engine and story data
const StoryEngine = require('./storyEngine');
const storyTemplates = require('./storyTemplates');

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Tyson\'s Tales Backend is running!' });
});

// Character endpoints
app.post('/api/characters', (req, res) => {
    const { user_id, name, gender, role, personalities, favorite_color, favorite_animal } = req.body;
    const id = uuidv4();

    db.run(
        `INSERT INTO characters (id, user_id, name, gender, role, personalities, favorite_color, favorite_animal) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user_id || null, name, gender, role, JSON.stringify(personalities), favorite_color, favorite_animal],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save character' });
            }
            res.json({
                id,
                message: 'Character saved successfully',
                character: { id, name, gender, role, personalities, favorite_color, favorite_animal }
            });
        }
    );
});

app.get('/api/characters/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(
        `SELECT * FROM characters WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch characters' });
            }

            const characters = rows.map(row => ({
                ...row,
                personalities: JSON.parse(row.personalities || '[]')
            }));

            res.json({ characters });
        }
    );
});

// Story endpoints
app.post('/api/story/start', (req, res) => {
    const { character, theme } = req.body;

    try {
        const storyEngine = new StoryEngine(storyTemplates, character);
        const initialNode = storyEngine.getInitialStoryNode(theme);

        if (!initialNode) {
            return res.status(404).json({ error: 'Story theme not found' });
        }

        // Save story progress
        const progressId = uuidv4();
        db.run(
            `INSERT INTO story_progress (id, user_id, character_id, story_theme, current_node_id, choices_made) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [progressId, character.user_id || null, character.id, theme, initialNode.current_node_id, '[]'],
            (err) => {
                if (err) console.error('Failed to save story progress:', err);
            }
        );

        res.json({
            story_progress_id: progressId,
            ...initialNode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start story' });
    }
});

app.post('/api/story/choice', (req, res) => {
    const { character, current_node_id, next_node_id, story_progress_id } = req.body;

    try {
        const storyEngine = new StoryEngine(storyTemplates, character);
        const nextNode = storyEngine.getStoryNode(next_node_id);

        if (!nextNode) {
            return res.status(404).json({ error: 'Story node not found' });
        }

        // Update story progress
        if (story_progress_id) {
            db.run(
                `UPDATE story_progress 
         SET current_node_id = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
                [next_node_id, story_progress_id],
                (err) => {
                    if (err) console.error('Failed to update story progress:', err);
                }
            );
        }

        res.json(nextNode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to progress story' });
    }
});

// Get available themes
app.get('/api/themes', (req, res) => {
    const themes = [
        { id: 'fantasy', name: 'Fantasy Kingdom', description: 'Magical adventures with dragons and wizards' },
        { id: 'space', name: 'Space Adventure', description: 'Explore the cosmos and meet alien friends' },
        { id: 'forest', name: 'Mysterious Forest', description: 'Discover secrets in an enchanted woodland' },
        { id: 'ocean', name: 'Undersea World', description: 'Dive deep and swim with sea creatures' },
        { id: 'timetravel', name: 'Time Travel', description: 'Journey through different eras of history' }
    ];
    res.json({ themes });
});

// Start server
app.listen(PORT, () => {
    console.log(`Tyson's Tales backend running on port ${PORT}`);
}); 