import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character } from '../types';

interface CharacterSelectProps {
    onCharacterSelected: (character: Character) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onCharacterSelected }) => {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            // For now, using a default user ID. In a real app, this would come from authentication
            const response = await axios.get('/api/characters/default-user');
            setCharacters(response.data.characters);
            setLoading(false);
        } catch (err) {
            setError('Failed to load characters');
            setLoading(false);
        }
    };

    const selectCharacter = (character: Character) => {
        onCharacterSelected(character);
        navigate('/theme');
    };

    const getRoleEmoji = (role: string) => {
        const emojis: { [key: string]: string } = {
            knight: '⚔️',
            astronaut: '🚀',
            detective: '🔍',
            wizard: '🧙',
            pirate: '🏴‍☠️',
            explorer: '🗺️',
            scientist: '🔬',
            artist: '🎨'
        };
        return emojis[role] || '✨';
    };

    return (
        <>
            <div className="page-header">
                <h1>Choose Your Character</h1>
                <p>Select a hero from your saved characters</p>
            </div>

            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <p className="error-message">{error}</p>
                        <button className="btn" onClick={loadCharacters}>Try Again</button>
                    </div>
                ) : characters.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <h2>No Saved Characters Yet</h2>
                        <p style={{ margin: '20px 0', color: '#666' }}>
                            You haven't created any characters yet. Let's make your first hero!
                        </p>
                        <button
                            className="btn"
                            onClick={() => navigate('/character/new')}
                        >
                            Create New Character
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="character-list">
                            {characters.map((character) => (
                                <div
                                    key={character.id}
                                    className="character-card"
                                    onClick={() => selectCharacter(character)}
                                >
                                    <h3>
                                        {getRoleEmoji(character.role)} {character.name}
                                    </h3>
                                    <p><strong>Role:</strong> {character.role}</p>
                                    <p><strong>Gender:</strong> {character.gender}</p>
                                    <p><strong>Traits:</strong> {character.personalities.join(', ')}</p>
                                    {character.favorite_color && (
                                        <p><strong>Favorite Color:</strong> {character.favorite_color}</p>
                                    )}
                                    {character.favorite_animal && (
                                        <p><strong>Favorite Animal:</strong> {character.favorite_animal}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CharacterSelect; 