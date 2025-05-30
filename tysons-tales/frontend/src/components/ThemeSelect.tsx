import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character, Theme } from '../types';
import { getApiUrl } from '../utils/api';

interface ThemeSelectProps {
    character: Character;
    onThemeSelected: (theme: string) => void;
}

const ThemeSelect: React.FC<ThemeSelectProps> = ({ character, onThemeSelected }) => {
    const navigate = useNavigate();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/themes'));
                setThemes(response.data.themes);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching themes:', error);
                setError('Failed to load themes. Please try again.');
                setLoading(false);
            }
        };

        fetchThemes();
    }, []);

    const selectTheme = (themeId: string) => {
        onThemeSelected(themeId);
        navigate('/story');
    };

    const getThemeEmoji = (themeId: string) => {
        const emojis: { [key: string]: string } = {
            fantasy: '🏰',
            space: '🚀',
            forest: '🌲',
            ocean: '🌊',
            timetravel: '⏰'
        };
        return emojis[themeId] || '✨';
    };

    const getThemeColor = (themeId: string) => {
        const colors: { [key: string]: string } = {
            fantasy: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
            space: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            forest: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            ocean: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            timetravel: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
        };
        return colors[themeId] || 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
    };

    return (
        <>
            <div className="page-header">
                <h1>Choose Your Adventure</h1>
                <p>Where will {character.name} the {character.role} explore today?</p>
            </div>

            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: 'red' }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="theme-grid">
                            {themes.map((theme) => (
                                <div
                                    key={theme.id}
                                    className="theme-card"
                                    onClick={() => selectTheme(theme.id)}
                                    style={{
                                        background: getThemeColor(theme.id),
                                        color: 'white',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '48px',
                                            marginBottom: '15px',
                                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                                        }}
                                    >
                                        {getThemeEmoji(theme.id)}
                                    </div>
                                    <h3 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                        {theme.name}
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {theme.description}
                                    </p>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            right: '-20px',
                                            width: '100px',
                                            height: '100px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '50%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ThemeSelect; 