import React from 'react';
import { Character } from '../App';

interface CharacterSelectProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onBackToMain: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  characters,
  selectedCharacter,
  onCharacterSelect,
  onBackToMain
}) => {
  return (
    <div className="character-select">
      <h2>Choose Your Character</h2>
      
      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
            onClick={() => onCharacterSelect(character)}
          >
            <div
              className="character-avatar"
              style={{ backgroundColor: character.color }}
            >
              {character.name.charAt(0)}
            </div>
            <div className="character-name">{character.name}</div>
            <div className="character-description">{character.description}</div>
          </div>
        ))}
      </div>

      {selectedCharacter && (
        <div className="character-details">
          <div className="selected-character-info">
            <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>
              🎮 已選擇: {selectedCharacter.name}
            </h3>
            <div className="character-full-description">
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#555',
                background: 'rgba(76, 175, 80, 0.1)',
                padding: '15px',
                borderRadius: '10px',
                border: '2px solid #4CAF50',
                margin: '0 auto',
                maxWidth: '500px'
              }}>
                {selectedCharacter.fullDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={onBackToMain}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;