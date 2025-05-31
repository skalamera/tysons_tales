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

    const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = React.useState(() => {
        return localStorage.getItem('selectedVoice') || '';
    });

    // Modal state for settings
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

    // Hover states for buttons
    const [createHover, setCreateHover] = React.useState(false);
    const [selectHover, setSelectHover] = React.useState(false);

    React.useEffect(() => {
        // Apply the theme to the document
        if (colorTheme === 'purple') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', colorTheme);
        }
    }, [colorTheme]);

    // Load available voices
    React.useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);

                // If no voice is selected, try to find a good default
                if (!selectedVoice) {
                    const preferredVoice = voices.find(voice =>
                        voice.name === 'Google US English' ||
                        voice.name.includes('Google US English')
                    );
                    if (preferredVoice) {
                        setSelectedVoice(preferredVoice.name);
                        localStorage.setItem('selectedVoice', preferredVoice.name);
                    } else {
                        // Fallback to other voices if Google US English not available
                        const fallbackVoice = voices.find(voice =>
                            voice.name.includes('Female') ||
                            voice.name.includes('Samantha') ||
                            voice.name.includes('Victoria') ||
                            voice.name.includes('Google US English Female')
                        );
                        if (fallbackVoice) {
                            setSelectedVoice(fallbackVoice.name);
                            localStorage.setItem('selectedVoice', fallbackVoice.name);
                        }
                    }
                }
            }
        };

        // Load voices immediately
        loadVoices();

        // Also load voices when they become available
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Clean up
        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [selectedVoice]);

    const handleAutoPlayToggle = () => {
        const newValue = !autoPlayAudio;
        setAutoPlayAudio(newValue);
        localStorage.setItem('autoPlayAudio', String(newValue));
    };

    const handleThemeChange = (theme: string) => {
        setColorTheme(theme);
        localStorage.setItem('colorTheme', theme);
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voiceName = e.target.value;
        setSelectedVoice(voiceName);
        localStorage.setItem('selectedVoice', voiceName);

        // Play a sample with the new voice
        if (voiceName) {
            const sampleText = "Hello! I'll be reading your story.";
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sampleText);
            const voice = availableVoices.find(v => v.name === voiceName);
            if (voice) {
                utterance.voice = voice;
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        }
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

    // Modern gradient for adventure card
    const adventureCardStyle: React.CSSProperties = {
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center' as const,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 50%, #e8eeff 100%)',
        boxShadow: '0 20px 40px -12px rgba(102,126,234,0.25)',
        borderRadius: '32px',
        padding: '60px 40px',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        border: '1px solid rgba(102,126,234,0.1)',
    };

    // Header box style
    const headerBoxStyle: React.CSSProperties = {
        maxWidth: '700px',
        margin: '0 auto 40px auto',
        textAlign: 'center' as const,
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 10px 30px -8px rgba(102,126,234,0.2)',
        borderRadius: '24px',
        padding: '40px 30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102,126,234,0.1)',
    };

    // Settings icon button style
    const settingsButtonStyle: React.CSSProperties = {
        position: 'fixed' as const,
        top: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid rgba(102,126,234,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px -2px rgba(102,126,234,0.15)',
        zIndex: 100,
    };

    // Modal overlay style
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out',
    };

    // Modal content style
    const modalContentStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease-out',
    };

    // Modal header style
    const modalHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px 16px 32px',
        borderBottom: '1px solid rgba(102,126,234,0.1)',
    };

    // Modern button style with hover
    const getModernBtnStyle = (isHovered: boolean): React.CSSProperties => ({
        width: '320px',
        fontSize: '19px',
        fontWeight: 700,
        borderRadius: '16px',
        padding: '20px 0',
        background: isHovered
            ? 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #818cf8 100%)',
        color: 'white',
        border: 'none',
        boxShadow: isHovered
            ? '0 8px 32px -8px rgba(124,58,237,0.5)'
            : '0 4px 16px -4px rgba(102,126,234,0.25)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
    });

    const getModernBtnSecondaryStyle = (isHovered: boolean): React.CSSProperties => ({
        ...getModernBtnStyle(false),
        background: isHovered
            ? 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)'
            : '#ffffff',
        color: '#667eea',
        border: '2px solid',
        borderColor: isHovered ? '#7c3aed' : '#667eea',
        boxShadow: isHovered
            ? '0 8px 32px -8px rgba(102,126,234,0.3)'
            : '0 2px 8px -2px rgba(102,126,234,0.15)',
        marginBottom: 0,
    });

    return (
        <>
            {/* Settings Button */}
            <button
                style={settingsButtonStyle}
                onClick={() => setSettingsModalOpen(true)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(102,126,234,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(102,126,234,0.15)';
                }}
                aria-label="Settings"
            >
                ⚙️
            </button>

            <div className="container" style={{ paddingTop: '40px' }}>
                {/* Title and Subtitle in White Box */}
                <div style={headerBoxStyle}>
                    <img
                        src="/tysons-tales-title.svg"
                        alt="Tyson's Tales"
                        style={{
                            maxWidth: '400px',
                            width: '90%',
                            height: 'auto',
                            marginBottom: '16px',
                        }}
                    />
                    <p style={{
                        fontSize: '20px',
                        color: '#64748b',
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: 1.5
                    }}>
                        Create magical adventures with your own personalized character
                    </p>
                </div>

                {/* Modern Adventure Card */}
                <div style={adventureCardStyle}>
                    {/* Animated background elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float 6s ease-in-out infinite',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-80px',
                        left: '-80px',
                        width: '250px',
                        height: '250px',
                        background: 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float 8s ease-in-out infinite reverse',
                    }} />

                    {/* Stars decoration */}
                    <div style={{ position: 'absolute', top: '40px', left: '40px', fontSize: '24px', opacity: 0.6, animation: 'twinkle 3s ease-in-out infinite' }}>✨</div>
                    <div style={{ position: 'absolute', top: '80px', right: '60px', fontSize: '20px', opacity: 0.5, animation: 'twinkle 3s ease-in-out infinite 0.5s' }}>⭐</div>
                    <div style={{ position: 'absolute', bottom: '60px', left: '80px', fontSize: '18px', opacity: 0.4, animation: 'twinkle 3s ease-in-out infinite 1s' }}>✨</div>

                    <h2 style={{
                        fontSize: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #7c3aed 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px',
                        zIndex: 1,
                        position: 'relative',
                        fontWeight: 800,
                        letterSpacing: '-0.02em'
                    }}>
                        Start Your Adventure!
                    </h2>
                    <p style={{
                        fontSize: '22px',
                        margin: '20px 0 40px',
                        color: '#475569',
                        zIndex: 1,
                        position: 'relative',
                        fontWeight: 400,
                        lineHeight: 1.5
                    }}>
                        Begin your magical journey into worlds of wonder
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        alignItems: 'center',
                        marginTop: '40px',
                        zIndex: 1,
                        position: 'relative'
                    }}>
                        <button
                            style={getModernBtnStyle(createHover)}
                            onMouseEnter={() => setCreateHover(true)}
                            onMouseLeave={() => setCreateHover(false)}
                            onClick={() => navigate('/character/new')}
                        >
                            <span style={{ fontSize: '24px' }}>✨</span>
                            <span>Create New Character</span>
                        </button>
                        <button
                            style={getModernBtnSecondaryStyle(selectHover)}
                            onMouseEnter={() => setSelectHover(true)}
                            onMouseLeave={() => setSelectHover(false)}
                            onClick={() => navigate('/character/select')}
                        >
                            <span style={{ fontSize: '24px' }}>📚</span>
                            <span>Choose Saved Character</span>
                        </button>
                    </div>

                    <div style={{
                        marginTop: '50px',
                        padding: '30px',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        zIndex: 1,
                        position: 'relative',
                        boxShadow: '0 4px 24px -4px rgba(102,126,234,0.1)',
                        border: '1px solid rgba(102,126,234,0.1)'
                    }}>
                        <h3 style={{
                            color: '#667eea',
                            marginBottom: '20px',
                            fontSize: '1.4rem',
                            fontWeight: 700
                        }}>
                            ✨ How It Works
                        </h3>
                        <ol style={{
                            textAlign: 'left',
                            lineHeight: '2',
                            color: '#475569',
                            fontSize: '17px',
                            paddingLeft: '20px'
                        }}>
                            <li>🎭 Create or select your unique character</li>
                            <li>🌟 Choose your adventure theme</li>
                            <li>🎯 Make choices to guide your story</li>
                            <li>🎧 Listen to your personalized tale!</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {settingsModalOpen && (
                <div style={modalOverlayStyle} onClick={() => setSettingsModalOpen(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={modalHeaderStyle}>
                            <h2 style={{
                                margin: 0,
                                color: '#667eea',
                                fontSize: '1.8rem',
                                fontWeight: 700
                            }}>
                                ⚙️ Settings
                            </h2>
                            <button
                                onClick={() => setSettingsModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    padding: '0',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                                    e.currentTarget.style.color = '#667eea';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                                aria-label="Close settings"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px 32px 32px 32px' }}>
                            {/* Color Theme Selector */}
                            <div style={{
                                marginBottom: '24px',
                                padding: '20px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🎨</span>
                                    <div>
                                        <label style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333'
                                        }}>
                                            Color Theme
                                        </label>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            margin: '4px 0 0 0'
                                        }}>
                                            Choose your preferred color scheme
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                    gap: '12px',
                                    marginTop: '16px'
                                }}>
                                    {themeOptions.map((theme) => (
                                        <button
                                            key={theme.value}
                                            onClick={() => handleThemeChange(theme.value)}
                                            style={{
                                                padding: '12px',
                                                border: colorTheme === theme.value ? '3px solid #333' : '2px solid #ddd',
                                                borderRadius: '10px',
                                                background: 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: theme.color
                                            }}></div>
                                            <span style={{
                                                fontSize: '13px',
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
                                padding: '20px',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🔊</span>
                                    <div>
                                        <label htmlFor="autoPlayToggle" style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333',
                                            cursor: 'pointer'
                                        }}>
                                            Auto-play Story Audio
                                        </label>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            margin: '4px 0 0 0'
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
                                        width: '52px',
                                        height: '28px',
                                        backgroundColor: autoPlayAudio ? '#667eea' : '#ccc',
                                        borderRadius: '28px',
                                        transition: 'background-color 0.3s'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            content: '',
                                            height: '22px',
                                            width: '22px',
                                            left: autoPlayAudio ? '28px' : '3px',
                                            bottom: '3px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}></span>
                                    </span>
                                </label>
                            </div>

                            {/* Voice Selector */}
                            <div style={{
                                padding: '20px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🗣️</span>
                                    <div>
                                        <label style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333'
                                        }}>
                                            Select Voice
                                        </label>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            margin: '4px 0 0 0'
                                        }}>
                                            Choose your preferred voice for narration
                                        </p>
                                    </div>
                                </div>
                                <select
                                    value={selectedVoice}
                                    onChange={handleVoiceChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '10px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontSize: '15px'
                                    }}
                                >
                                    <option value="">Select a voice</option>
                                    {availableVoices
                                        .filter(voice => voice.lang.startsWith('en'))
                                        .map((voice) => (
                                            <option key={voice.name} value={voice.name}>
                                                {voice.name} ({voice.lang})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            `}</style>
        </>
    );
};

export default Welcome; 