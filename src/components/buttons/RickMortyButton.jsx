import React from 'react';
import './RickMortyButton.css';

export default function RickMortyButton({ text, onClick, className = '' }) {
    return (
        <button
            className={`rick-morty-button ${className}`}
            onClick={onClick}
        >
            <span className="button-text">{text}</span>
        </button>
    );
};

