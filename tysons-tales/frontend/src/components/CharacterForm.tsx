import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character } from '../types';
import { getUserId } from '../utils/userUtils';

interface CharacterFormProps {
    onCharacterSaved: (character: Character) => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ onCharacterSaved }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Character>({
        name: '',
        gender: 'neutral',
        role: 'knight',
        age: 7,
        personalities: [],
        favorite_color: '',
        favorite_animal: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        { value: 'knight', label: 'Brave Knight' },
        { value: 'astronaut', label: 'Curious Astronaut' },
        { value: 'detective', label: 'Clever Detective' },
        { value: 'wizard', label: 'Magical Wizard' },
        { value: 'pirate', label: 'Adventurous Pirate' },
        { value: 'explorer', label: 'Fearless Explorer' },
        { value: 'scientist', label: 'Smart Scientist' },
        { value: 'artist', label: 'Creative Artist' }
    ];

    const personalityTraits = [
        'brave', 'curious', 'kind', 'funny', 'smart',
        'creative', 'adventurous', 'friendly', 'determined', 'imaginative'
    ];

    const handlePersonalityChange = (trait: string) => {
        setFormData(prev => ({
            ...prev,
            personalities: prev.personalities.includes(trait)
                ? prev.personalities.filter(p => p !== trait)
                : [...prev.personalities, trait]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Please enter a character name');
            return;
        }

        if (formData.personalities.length === 0) {
            setError('Please select at least one personality trait');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/characters', {
                ...formData,
                user_id: getUserId()
            });
            const savedCharacter = response.data.character;
            onCharacterSaved(savedCharacter);
            navigate('/theme');
        } catch (err) {
            setError('Failed to save character. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Create Your Character</h1>
                <p>Design a unique hero for your adventure!</p>
            </div>

            <div className="container">
                <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Character Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your character's name"
                                maxLength={30}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                            >
                                <option value="girl">Girl</option>
                                <option value="boy">Boy</option>
                                <option value="neutral">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <select
                                id="age"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            >
                                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                                    <option key={age} value={age}>{age} years old</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Personality Traits (select up to 3)</label>
                            <div className="checkbox-group">
                                {personalityTraits.map(trait => (
                                    <div
                                        key={trait}
                                        className={`checkbox-item ${formData.personalities.includes(trait) ? 'checked' : ''}`}
                                        onClick={() => {
                                            if (formData.personalities.length < 3 || formData.personalities.includes(trait)) {
                                                handlePersonalityChange(trait);
                                            }
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.personalities.includes(trait)}
                                            onChange={() => { }} // Handled by div onClick
                                            disabled={formData.personalities.length >= 3 && !formData.personalities.includes(trait)}
                                        />
                                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="favorite_color">Favorite Color (optional)</label>
                            <input
                                type="text"
                                id="favorite_color"
                                value={formData.favorite_color}
                                onChange={(e) => setFormData({ ...formData, favorite_color: e.target.value })}
                                placeholder="e.g., blue, rainbow, starlight"
                                maxLength={20}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="favorite_animal">Favorite Animal (optional)</label>
                            <input
                                type="text"
                                id="favorite_animal"
                                value={formData.favorite_animal}
                                onChange={(e) => setFormData({ ...formData, favorite_animal: e.target.value })}
                                placeholder="e.g., dragon, unicorn, puppy"
                                maxLength={20}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn"
                                disabled={loading}
                            >
                                {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : 'Create Character'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CharacterForm; 