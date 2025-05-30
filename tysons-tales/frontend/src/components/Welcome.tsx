import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
    const navigate = useNavigate();

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
            </div>
        </>
    );
};

export default Welcome; 