import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const [autoPlayAudio, setAutoPlayAudio] = React.useState(() => {
        // Get saved preference from localStorage, default to true
        const saved = localStorage.getItem('autoPlayAudio');
        return saved === null ? true : saved === 'true';
    });

    const [colorTheme, setColorTheme] = React.useState(() => {
        // Get saved theme from localStorage, default to purple
        return localStorage.getItem('colorTheme') || 'purple';
    });

    React.useEffect(() => {
        // Apply the theme to the document
        if (colorTheme === 'purple') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', colorTheme);
        }
    }, [colorTheme]);

    const handleAutoPlayToggle = () => {
        const newValue = !autoPlayAudio;
        setAutoPlayAudio(newValue);
        localStorage.setItem('autoPlayAudio', String(newValue));
    };

    const handleThemeChange = (theme: string) => {
        setColorTheme(theme);
        localStorage.setItem('colorTheme', theme);
    };

    const themeOptions = [
        { value: 'purple', label: 'Purple', color: '#667eea' },
        { value: 'red', label: 'Red', color: '#ea6666' },
        { value: 'green', label: 'Green', color: '#66ea7e' },
        { value: 'blue', label: 'Blue', color: '#6691ea' },
        { value: 'orange', label: 'Orange', color: '#ea9166' },
        { value: 'pink', label: 'Pink', color: '#ea66c4' },
        { value: 'teal', label: 'Teal', color: '#66eac4' },
        { value: 'yellow', label: 'Yellow', color: '#eac466' },
        { value: 'indigo', label: 'Indigo', color: '#8166ea' }
    ];

    return (
        <>
            <div className="page-header">
                <h1>Welcome to Tyson's Tales!</h1>
                <p>Create magical adventures with your own personalized character</p>
            </div>

            <div className="container">
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h2>Start Your Adventure!</h2>
                    <p style={{ fontSize: '18px', margin: '20px 0', color: '#666' }}>
                        Choose how you'd like to begin your magical journey:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '30px' }}>
                        <button
                            className="btn"
                            onClick={() => navigate('/character/new')}
                            style={{ width: '300px' }}
                        >
                            ✨ Create New Character
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/character/select')}
                            style={{ width: '300px' }}
                        >
                            📚 Choose Saved Character
                        </button>
                    </div>

                    <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                        <h3 style={{ color: '#667eea', marginBottom: '15px' }}>How It Works:</h3>
                        <ol style={{ textAlign: 'left', lineHeight: '1.8', color: '#555' }}>
                            <li>Create or select your character</li>
                            <li>Choose your adventure theme</li>
                            <li>Make choices to guide your story</li>
                            <li>Listen to your personalized tale!</li>
                        </ol>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="card" style={{ maxWidth: '600px', margin: '30px auto', padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#667eea' }}>⚙️ Settings</h3>

                    {/* Color Theme Selector */}
                    <div style={{
                        marginBottom: '20px',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '20px' }}>🎨</span>
                            <div>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Color Theme
                                </label>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    margin: '5px 0 0 0'
                                }}>
                                    Choose your preferred color scheme
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                            gap: '10px',
                            marginTop: '15px'
                        }}>
                            {themeOptions.map((theme) => (
                                <button
                                    key={theme.value}
                                    onClick={() => handleThemeChange(theme.value)}
                                    style={{
                                        padding: '10px',
                                        border: colorTheme === theme.value ? '3px solid #333' : '2px solid #ddd',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: theme.color
                                    }}></div>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: colorTheme === theme.value ? 'bold' : 'normal'
                                    }}>
                                        {theme.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Auto-play Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>🔊</span>
                            <div>
                                <label htmlFor="autoPlayToggle" style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#333',
                                    cursor: 'pointer'
                                }}>
                                    Auto-play Story Audio
                                </label>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    margin: '5px 0 0 0'
                                }}>
                                    Automatically narrate the story as pages load
                                </p>
                            </div>
                        </div>

                        <label className="toggle-switch" style={{ cursor: 'pointer' }}>
                            <input
                                id="autoPlayToggle"
                                type="checkbox"
                                checked={autoPlayAudio}
                                onChange={handleAutoPlayToggle}
                                style={{ display: 'none' }}
                            />
                            <span className="toggle-slider" style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '50px',
                                height: '26px',
                                backgroundColor: autoPlayAudio ? '#667eea' : '#ccc',
                                borderRadius: '26px',
                                transition: 'background-color 0.3s'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '',
                                    height: '20px',
                                    width: '20px',
                                    left: autoPlayAudio ? '27px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    transition: 'left 0.3s'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome; 