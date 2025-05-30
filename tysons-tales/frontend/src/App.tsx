import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import CharacterForm from './components/CharacterForm';
import CharacterSelect from './components/CharacterSelect';
import ThemeSelect from './components/ThemeSelect';
import StoryDisplay from './components/StoryDisplay';
import { Character } from './types';
import './App.css';

function App() {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string>('');

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route
                        path="/character/new"
                        element={
                            <CharacterForm
                                onCharacterSaved={(character) => {
                                    setSelectedCharacter(character);
                                }}
                            />
                        }
                    />
                    <Route
                        path="/character/select"
                        element={
                            <CharacterSelect
                                onCharacterSelected={(character) => {
                                    setSelectedCharacter(character);
                                }}
                            />
                        }
                    />
                    <Route
                        path="/theme"
                        element={
                            selectedCharacter ? (
                                <ThemeSelect
                                    character={selectedCharacter}
                                    onThemeSelected={(theme) => {
                                        setSelectedTheme(theme);
                                    }}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/story"
                        element={
                            selectedCharacter && selectedTheme ? (
                                <StoryDisplay
                                    character={selectedCharacter}
                                    theme={selectedTheme}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App; 