import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character, StoryNode } from '../types';

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
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        startStory();
        return () => {
            // Clean up speech synthesis on unmount
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (currentNode && currentNode.story_text) {
            // Auto-play narration when new text appears
            speakText(currentNode.story_text);
        }
    }, [currentNode]);

    const startStory = async () => {
        try {
            const response = await axios.post('/api/story/start', {
                character,
                theme
            });

            setStoryProgressId(response.data.story_progress_id);
            setCurrentNode({
                story_text: response.data.story_text,
                illustration_url: response.data.illustration_url,
                illustration_prompt: response.data.illustration_prompt,
                choices: response.data.choices,
                current_node_id: response.data.current_node_id
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to start the story');
            setLoading(false);
        }
    };

    const makeChoice = async (nextNodeId: string) => {
        setLoading(true);

        try {
            const response = await axios.post('/api/story/choice', {
                character,
                current_node_id: currentNode?.current_node_id,
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
            setLoading(false);
        } catch (err) {
            setError('Failed to continue the story');
            setLoading(false);
        }
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
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

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            speechSynthesisRef.current = utterance;
            window.speechSynthesis.speak(utterance);
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
                <h1>{character.name}'s Adventure</h1>
                <p>An interactive story just for you!</p>
            </div>

            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <p className="error-message">{error}</p>
                        <button className="btn" onClick={startStory}>Try Again</button>
                    </div>
                ) : currentNode ? (
                    <div className="story-container">
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