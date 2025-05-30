# Tyson's Tales - Interactive Children's Story App

Welcome to Tyson's Tales! An interactive web application that creates personalized, illustrated, and narrated "choose your own adventure" stories for children.

## Features

- **Personalized Characters**: Create custom characters with names, roles, personalities, and preferences
- **Multiple Story Themes**: Choose from Fantasy Kingdom, Space Adventure, Mysterious Forest, Undersea World, or Time Travel themes
- **Interactive Storytelling**: Make choices that affect the story's direction
- **Text-to-Speech Narration**: Stories are narrated using browser's speech synthesis
- **Beautiful Illustrations**: Each story scene includes colorful placeholder illustrations (ready for AI image integration)
- **Save Characters**: Create and save multiple characters for future adventures
- **Child-Friendly Design**: Colorful, engaging UI designed specifically for children

## Technology Stack

### Backend
- Node.js with Express.js
- SQLite database for data persistence
- Story Engine for dynamic content generation
- RESTful API architecture

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API communication
- Web Speech API for text-to-speech
- Responsive, mobile-friendly design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
cd tysons-tales
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend will run on http://localhost:5000

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The frontend will run on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000

## How to Use

1. **Welcome Screen**: Choose to create a new character or select a saved one
2. **Character Creation**: 
   - Enter your character's name
   - Select gender (for appropriate pronouns)
   - Choose a role (knight, astronaut, detective, etc.)
   - Select up to 3 personality traits
   - Optionally add favorite color and animal
3. **Theme Selection**: Pick an adventure theme
4. **Story Time**: 
   - Read/listen to your personalized story
   - Make choices to guide the adventure
   - Use audio controls to play, pause, or replay narration

## Project Structure

```
tysons-tales/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── storyEngine.js     # Story personalization logic
│   ├── storyTemplates.js  # Story content and branching paths
│   └── database/          # SQLite database files
├── frontend/
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # React components
│       ├── types.ts       # TypeScript type definitions
│       ├── App.tsx        # Main app component
│       └── index.tsx      # App entry point
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/characters` - Create a new character
- `GET /api/characters/:userId` - Get user's characters
- `GET /api/themes` - Get available story themes
- `POST /api/story/start` - Start a new story
- `POST /api/story/choice` - Make a story choice

## Future Enhancements

- **AI Image Generation**: Integrate with DALL-E or Stable Diffusion for dynamic illustrations
- **Cloud TTS Integration**: Use professional TTS services for better voice quality
- **User Authentication**: Add login system for multiple users
- **More Story Content**: Expand story templates and branching paths
- **Story Sharing**: Allow users to share their adventures
- **Multilingual Support**: Add stories in multiple languages
- **Offline Mode**: Cache stories for offline reading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 