import Move from '../../utils/game/Move';
import { useGameContext } from '../../context/GameContext';

const Piece = ({ color, id }) => {
  const { 
    currentPlayer, 
    diceNumberValue, 
    playerPositions, 
    setDiceDisabled, 
    setPlayerPositions, 
    nextTurn, 
    win, 
    setWin,
    isMyTurn,
    myColor,
    moveToken,
    roomCode
  } = useGameContext();

  function colorGenerator(color) {
    switch (color) {
      case 'red':
        return '#FF0800';
      case 'blue':
        return '#0000FF';
      case 'green':
        return '#4CBB17';
      case 'yellow':
        return '#FFC40C';
      default:
        return 'white';
    }
  }

  const make_a_move = (e) => {
    const diceNumber = diceNumberValue.current;
    
    let pieceId;
    if (e.target.id) {
      pieceId = e.target.id;
    } else {
      pieceId = e.target.parentElement.id;
    }

    const [pieceColor, indexStr] = pieceId.split("-");
    const index = parseInt(indexStr, 10);

    if (roomCode && moveToken) {
      if (!isMyTurn || pieceColor !== myColor || diceNumber === 0) return;

      const currentPosition = playerPositions[pieceColor]?.[index] ?? 0;
      let newPosition;

      const isAtHome = currentPosition === 0 || currentPosition === -1;
      
      if (isAtHome) {
        if (diceNumber === 6) {
          if (pieceColor === 'red') {
            newPosition = 1;
          } else if (pieceColor === 'blue') {
            newPosition = 40;
          } else if (pieceColor === 'green') {
            newPosition = 27;
          } else if (pieceColor === 'yellow') {
            newPosition = 14;
          }
        } else {
          return;
        }
      } else {
        newPosition = currentPosition + diceNumber;
      }

      moveToken(index, currentPosition, newPosition);
    } else {
      Move(e, { currentPlayer, playerPositions, diceNumberValue, setDiceDisabled, setPlayerPositions, nextTurn, win, setWin });
    }
  };

  return (
    <div id={id} className="piece" style={{ backgroundColor: colorGenerator(color) }} onClick={make_a_move}>
      <div className="piece-inner"></div>
    </div>
  );
};

export default Piece;
