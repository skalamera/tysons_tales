import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character, StoryNode } from '../types';
import { getUserId } from '../utils/userUtils';

interface StoryDisplayProps {
    character: Character;
    theme: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ character, theme }) => {
    const navigate = useNavigate();
    const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [storyProgressId, setStoryProgressId] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Creating your adventure...');
    const [storyTitle, setStoryTitle] = useState<string>('');
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const hasStartedRef = useRef(false);
    const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const messageIndexRef = useRef(0);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
        // Get auto-play preference from localStorage, default to true
        const saved = localStorage.getItem('autoPlayAudio');
        return saved === null ? true : saved === 'true';
    });

    // Define loading messages for different contexts
    const startStoryMessages = [
        'Creating your adventure...',
        'Imagining magical worlds...',
        'Writing your story...',
        'Painting beautiful scenes...',
        'Adding finishing touches...',
        'Almost ready...'
    ];

    const continueStoryMessages = [
        'Writing the next chapter...',
        'Creating magical illustrations...',
        'Weaving your choices into the tale...',
        'Painting new scenes...',
        'Preparing your adventure...',
        'Almost there...'
    ];

    // Function to cycle through loading messages
    const startLoadingMessages = (messages: string[]) => {
        messageIndexRef.current = 0;
        setLoadingMessage(messages[0]);

        // Clear any existing timer
        if (loadingTimerRef.current) {
            clearInterval(loadingTimerRef.current);
        }

        // Set up new timer to cycle through messages
        loadingTimerRef.current = setInterval(() => {
            messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;
            setLoadingMessage(messages[messageIndexRef.current]);
        }, 2000); // Change message every 2 seconds
    };

    // Clean up timer when component unmounts or loading completes
    const stopLoadingMessages = () => {
        if (loadingTimerRef.current) {
            clearInterval(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
    };

    useEffect(() => {
        // Prevent double initialization in StrictMode
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startStory();
        }

        return () => {
            // Clean up speech synthesis on unmount
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            // Clean up loading timer
            stopLoadingMessages();
        };
    }, []);

    useEffect(() => {
        if (currentNode && currentNode.story_text && autoPlayEnabled) {
            // Auto-play narration when new text appears (only if auto-play is enabled)
            speakText(currentNode.story_text);
        }
    }, [currentNode?.current_node_id]); // Only trigger when the node ID changes, not the entire object

    // Debug effect to log loading state changes
    useEffect(() => {
        console.log('Loading state changed:', loading, 'Loading message:', loadingMessage);
    }, [loading, loadingMessage]);

    const startStory = async () => {
        console.log('startStory: Setting loading to true');
        setLoading(true);
        startLoadingMessages(startStoryMessages);

        try {
            const response = await axios.post('/api/story/start', {
                character: {
                    ...character,
                    user_id: getUserId()
                },
                theme
            });

            setStoryProgressId(response.data.story_progress_id);
            // Set the story title from the first response
            if (response.data.title) {
                setStoryTitle(response.data.title);
            }
            setCurrentNode({
                title: response.data.title,
                story_text: response.data.story_text,
                illustration_url: response.data.illustration_url,
                illustration_prompt: response.data.illustration_prompt,
                choices: response.data.choices,
                current_node_id: response.data.current_node_id
            });
            console.log('startStory: Success! Setting loading to false');
            stopLoadingMessages();  // Stop the message cycling
            setLoading(false);  // Hide loading screen
        } catch (err) {
            console.error('startStory: Error occurred', err);
            stopLoadingMessages();  // Stop the message cycling
            setError('Failed to start the story');
            setLoading(false);  // Hide loading screen
        }
    };

    const makeChoice = async (nextNodeId: string) => {
        // Stop any ongoing speech when making a choice
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }

        console.log('makeChoice: Setting loading to true');
        setLoading(true);
        startLoadingMessages(continueStoryMessages);

        try {
            const response = await axios.post('/api/story/choice', {
                character: {
                    ...character,
                    user_id: getUserId()
                },
                theme,
                next_node_id: nextNodeId,
                story_progress_id: storyProgressId
            });

            setCurrentNode({
                story_text: response.data.story_text,
                illustration_url: response.data.illustration_url,
                illustration_prompt: response.data.illustration_prompt,
                choices: response.data.choices,
                current_node_id: response.data.current_node_id
            });
            console.log('makeChoice: Success! Setting loading to false');
            stopLoadingMessages();  // Stop the message cycling
            setLoading(false);  // Hide loading screen
        } catch (err) {
            console.error('makeChoice: Error occurred', err);
            stopLoadingMessages();  // Stop the message cycling
            setError('Failed to continue the story');
            setLoading(false);  // Hide loading screen
        }
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Split text into sentences (handling common punctuation)
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

            // Create an array of utterances
            const utterances = sentences.map(sentence => {
                const utterance = new SpeechSynthesisUtterance(sentence.trim());
                utterance.lang = 'en-US';
                utterance.rate = 0.9; // Slightly slower for children
                utterance.pitch = 1.1; // Slightly higher pitch

                // Try to find a child-friendly voice
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice =>
                    voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Victoria')
                );

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                return utterance;
            });

            // Set up event handlers for the first utterance
            utterances[0].onstart = () => setIsPlaying(true);
            utterances[utterances.length - 1].onend = () => setIsPlaying(false);
            utterances[utterances.length - 1].onerror = () => setIsPlaying(false);

            // Queue all utterances
            utterances.forEach(utterance => {
                window.speechSynthesis.speak(utterance);
            });

            speechSynthesisRef.current = utterances[0];
        }
    };

    const togglePlayPause = () => {
        if (!window.speechSynthesis) return;

        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
        } else if (currentNode) {
            speakText(currentNode.story_text);
        }
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    };

    const replay = () => {
        if (currentNode) {
            speakText(currentNode.story_text);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>{storyTitle || `${character.name}'s Adventure`}</h1>
                <p>An interactive story just for you!</p>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div className="loading-content" style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto 30px' }}></div>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>{loadingMessage}</h3>
                            <div className="loading-progress" style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginTop: '20px'
                            }}>
                                <div className="loading-bar" style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#667eea',
                                    animation: 'loadingAnimation 2s ease-in-out infinite'
                                }}></div>
                            </div>
                            <style>{`
                                @keyframes loadingAnimation {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                            `}</style>
                        </div>
                    </div>
                ) : error ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <p className="error-message">{error}</p>
                        <button className="btn" onClick={startStory}>Try Again</button>
                    </div>
                ) : currentNode ? (
                    <div className="story-container">
                        {/* Leave Story Button - Centered */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                                style={{ fontSize: '16px', padding: '8px 16px' }}
                            >
                                Leave Story
                            </button>
                        </div>

                        {/* Story Illustration */}
                        {currentNode.illustration_url && (
                            <img
                                src={currentNode.illustration_url}
                                alt="Story scene"
                                className="story-illustration"
                            />
                        )}

                        {/* Story Text */}
                        <div className="story-text">
                            <p>{currentNode.story_text}</p>
                        </div>

                        {/* Audio Controls */}
                        <div className="audio-controls">
                            <button
                                className="audio-btn"
                                onClick={togglePlayPause}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button
                                className="audio-btn"
                                onClick={stopSpeaking}
                                title="Stop"
                            >
                                ⏹️
                            </button>
                            <button
                                className="audio-btn"
                                onClick={replay}
                                title="Replay"
                            >
                                🔄
                            </button>
                        </div>

                        {/* Story Choices */}
                        {currentNode.choices.length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    What should {character.name} do next?
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {currentNode.choices.map((choice, index) => (
                                        <button
                                            key={index}
                                            className="btn btn-choice"
                                            onClick={() => makeChoice(choice.next_node_id)}
                                            disabled={loading}
                                        >
                                            {choice.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* End of story options */}
                        {currentNode.choices.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <h2 style={{ color: '#667eea', marginBottom: '20px' }}>The End!</h2>
                                <p style={{ marginBottom: '30px', fontSize: '18px' }}>
                                    What a wonderful adventure!
                                </p>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <button
                                        className="btn"
                                        onClick={() => navigate('/theme')}
                                    >
                                        New Adventure
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/')}
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default StoryDisplay; 