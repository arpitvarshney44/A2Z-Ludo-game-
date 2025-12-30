import { useState, useEffect } from 'react';
import Piece from './Piece';
import Home from './Home';
import Square from './Square';
import trackLayout from '../../utils/game/TrackLayout';
import { useGameContext } from '../../context/GameContext';

const Board = () => {
  const { playerPositions, currentPlayer, size } = useGameContext();
  const [layout, setLayout] = useState(trackLayout);

  useEffect(() => {
    const updatedLayout = { ...trackLayout };

    // Reset all pieces
    Object.values(updatedLayout).forEach((value) => {
      if (value) {
        value.Piece = [];
      }
    });

    // Place pieces on the board
    Object.entries(playerPositions).forEach(([color, positions]) => {
      if (!positions) return;
      
      positions.forEach((position, index) => {
        // Skip home positions (0 or -1) and winning positions
        if (position <= 0 || position === 106 || position === 206 || position === 306 || position === 406) {
          return;
        }
        
        // Only add piece if the position exists in the layout
        if (updatedLayout[position]) {
          updatedLayout[position].Piece.push(`${color}-${index}`);
        }
      });
    });

    setLayout(updatedLayout);
  }, [playerPositions, currentPlayer]);

  return (
    <div id="board" style={{ transform: `scale(${size.board})` }}>
      {['red', 'green', 'yellow', 'blue'].map((color) => (
        <Home key={color} color={color}>
          {playerPositions[color]?.map((position, index) => {
            // Show piece in home if position is 0 or -1 (server uses -1 for home)
            if (position === 0 || position === -1) {
              return <Piece key={index} id={`${color}-${index}`} color={color} />;
            }
            return null;
          })}
        </Home>
      ))}
      <Square />
      {Object.entries(layout).map(([key, value]) => {
        if (!value || !value.Piece) return null;
        
        const numberOfPieces = value.Piece.length;
        const childClassName = numberOfPieces > 1 ? 'multiple-pieces' : '';

        return (
          <div key={key} className={`${value.type} track-${key} ${childClassName}`}>
            {value.Piece.map((piece, i) => (
              <Piece key={i} id={piece} color={piece.split('-')[0]} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Board;
