import { useGameContext } from '../../context/GameContext';

const PlayerChance = () => {
  const { currentPlayer } = useGameContext();

  return (
    <div className='current-player-info'>
      <h3 className='current-player-heading'>Player's Turn</h3>
      <h1 className={`current-player-name cpn-${currentPlayer}`}>{currentPlayer.toUpperCase()}</h1>
    </div>
  );
};

export default PlayerChance;
