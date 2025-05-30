import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character } from '../types';
import { getUserId } from '../utils/userUtils';

interface CharacterSelectProps {
    onCharacterSelected: (character: Character) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onCharacterSelected }) => {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const userId = getUserId(); // Get the user ID from localStorage
            const response = await axios.get(`http://localhost:5000/api/characters/${userId}`);
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

    const handleDeleteClick = (e: React.MouseEvent, character: Character) => {
        e.stopPropagation(); // Prevent character selection when clicking delete
        setCharacterToDelete(character);
    };

    const confirmDelete = async () => {
        if (!characterToDelete?.id) return;

        try {
            await axios.delete(`http://localhost:5000/api/characters/${characterToDelete.id}`);
            setCharacters(characters.filter(c => c.id !== characterToDelete.id));
            setCharacterToDelete(null);
        } catch (err) {
            setError('Failed to delete character');
        }
    };

    const cancelDelete = () => {
        setCharacterToDelete(null);
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
                                    <div className="character-card-header">
                                        <h3>
                                            {getRoleEmoji(character.role)} {character.name}
                                        </h3>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => handleDeleteClick(e, character)}
                                            title="Delete character"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <p><strong>Role:</strong> {character.role}</p>
                                    <p><strong>Gender:</strong> {character.gender}</p>
                                    <p><strong>Age:</strong> {character.age} years old</p>
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

                {/* Delete Confirmation Modal */}
                {characterToDelete && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Delete Character?</h3>
                            <p>Are you sure you want to delete {characterToDelete.name}? This cannot be undone.</p>
                            <div className="modal-buttons">
                                <button className="btn btn-secondary" onClick={cancelDelete}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CharacterSelect; 