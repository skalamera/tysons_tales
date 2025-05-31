require('dotenv').config();
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

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Database setup
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database/tysons_tales.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!require('fs').existsSync(dbDir)) {
    require('fs').mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database successfully');
    }
});

// Create tables
db.serialize(() => {
    // Characters table
    db.run(`CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    role TEXT NOT NULL,
    age INTEGER NOT NULL,
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

    // Add age column to existing characters table if it doesn't exist
    db.run(`ALTER TABLE characters ADD COLUMN age INTEGER`, (err) => {
        if (err) {
            // Column might already exist, which is fine
            if (!err.message.includes('duplicate column name')) {
                console.log('Note: Could not add age column:', err.message);
            }
        } else {
            console.log('Added age column to characters table');
            // Set default age for existing characters
            db.run(`UPDATE characters SET age = 7 WHERE age IS NULL`);
        }
    });
});

// Import story engine and story data
const StoryEngine = require('./storyEngine');
// const storyTemplates = require('./storyTemplates'); // Will not be passed to StoryEngine constructor anymore

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Tyson\'s Tales Backend is running!' });
});

// Character endpoints
app.post('/api/characters', (req, res) => {
    console.log('POST /api/characters - Request body:', req.body);

    const { user_id, name, gender, role, age, personalities, favorite_color, favorite_animal } = req.body;

    // Validate required fields
    if (!name || !gender || !role || age === undefined || age === null) {
        console.error('Missing required fields:', { name, gender, role, age });
        return res.status(400).json({
            error: 'Missing required fields',
            details: {
                name: !name ? 'Name is required' : null,
                gender: !gender ? 'Gender is required' : null,
                role: !role ? 'Role is required' : null,
                age: (age === undefined || age === null) ? 'Age is required' : null
            }
        });
    }

    // Ensure personalities is an array
    const personalitiesArray = Array.isArray(personalities) ? personalities : [];

    const id = uuidv4();

    const values = [
        id,
        user_id || null,
        name,
        gender,
        role,
        age,
        JSON.stringify(personalitiesArray),
        favorite_color || null,
        favorite_animal || null
    ];

    console.log('Inserting character with values:', values);

    db.run(
        `INSERT INTO characters (id, user_id, name, gender, role, age, personalities, favorite_color, favorite_animal) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
        (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save character', details: err.message });
            }

            console.log('Character saved successfully:', id);
            res.json({
                id,
                message: 'Character saved successfully',
                character: { id, name, gender, role, age, personalities: personalitiesArray, favorite_color, favorite_animal }
            });
        }
    );
});

app.get('/api/characters/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(
        `SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC`,
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

// Add delete character endpoint
app.delete('/api/characters/:characterId', (req, res) => {
    const { characterId } = req.params;

    db.run(
        `DELETE FROM characters WHERE id = ?`,
        [characterId],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to delete character' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Character not found' });
            }
            res.json({ message: 'Character deleted successfully' });
        }
    );
});

// Story endpoints
app.post('/api/story/start', async (req, res) => {
    const { character, theme } = req.body;

    try {
        // StoryTemplates is no longer passed if using AI for generation
        const storyEngine = new StoryEngine(character);
        const initialNode = await storyEngine.getInitialStoryNode(theme);

        if (!initialNode) {
            return res.status(404).json({ error: 'Story theme not found or AI error' });
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
        console.error("Error in /api/story/start:", error);
        res.status(500).json({ error: 'Failed to start story' });
    }
});

app.post('/api/story/choice', async (req, res) => {
    const { character, theme, next_node_id, story_progress_id } = req.body;

    try {
        // Fetch current choices_made for this story_progress_id
        let stepsTaken = 0;
        if (story_progress_id) {
            const row = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT choices_made FROM story_progress WHERE id = ?`,
                    [story_progress_id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
            if (row && row.choices_made) {
                const choicesArr = JSON.parse(row.choices_made);
                stepsTaken = Array.isArray(choicesArr) ? choicesArr.length : 0;
            }
        }

        // Set the cap
        const STORY_LENGTH_CAP = 7;
        const storyEngine = new StoryEngine(character);
        const nextNode = await storyEngine.getNextStoryNode(theme, next_node_id, stepsTaken + 1, STORY_LENGTH_CAP);

        if (!nextNode) {
            return res.status(404).json({ error: 'Story node not found or AI error' });
        }

        // Update story progress (add this choice to choices_made)
        if (story_progress_id) {
            // Add the new choice to choices_made
            db.get(
                `SELECT choices_made FROM story_progress WHERE id = ?`,
                [story_progress_id],
                (err, row) => {
                    let updatedChoices = [];
                    if (!err && row && row.choices_made) {
                        try {
                            updatedChoices = JSON.parse(row.choices_made);
                        } catch (e) { }
                    }
                    updatedChoices.push(next_node_id);
                    db.run(
                        `UPDATE story_progress 
                         SET current_node_id = ?, choices_made = ?, updated_at = CURRENT_TIMESTAMP 
                         WHERE id = ?`,
                        [nextNode.current_node_id, JSON.stringify(updatedChoices), story_progress_id],
                        (err) => {
                            if (err) console.error('Failed to update story progress:', err);
                        }
                    );
                }
            );
        }

        res.json(nextNode);
    } catch (error) {
        console.error("Error in /api/story/choice:", error);
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
        { id: 'timetravel', name: 'Time Travel', description: 'Journey through different eras of history' },
        { id: 'vehicles', name: 'Talking Vehicles World', description: 'Adventures with talking cars, trucks, and construction vehicles' },
        { id: 'dinosaurs', name: 'Dinosaur World', description: 'Exciting journeys with friendly dinosaurs' },
        { id: 'pirates', name: 'Pirate Adventure', description: 'Sail the seven seas in search of treasure' },
        { id: 'superhero', name: 'Superhero City', description: 'Save the day with amazing superpowers' },
        { id: 'magic_school', name: 'Magic School', description: 'Learn spells and make magical friends' },
        { id: 'safari', name: 'Safari Adventure', description: 'Meet wild animals on an African safari' },
        { id: 'candyland', name: 'Candy Land', description: 'Explore a world made of sweets and treats' },
        { id: 'robots', name: 'Robot Factory', description: 'Build and befriend helpful robots' },
        { id: 'fairytale', name: 'Fairytale Land', description: 'Meet classic storybook characters' },
        { id: 'arctic', name: 'Arctic Expedition', description: 'Explore icy lands with polar friends' }
    ];
    res.json({ themes });
});

// Serve React app for all other routes
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Tyson's Tales backend running on port ${PORT}`);
}); 