import { useGameContext } from '../../context/GameContext';

const PlayersRank = () => {
  const { win } = useGameContext();

  const medals = ['🥇', '🥈']; // Only 2 medals for 2 players

  return (
    <div className='players-rank'>
      <h2 className='rank-heading'>Final Rankings</h2>
      <div className='rank-list'>
        {win.map((player, index) => (
          <div key={index} className={`rank-item rank-${index + 1}`}>
            <span className='medal'>{medals[index]}</span>
            <span className={`player-name pn-${player}`}>{player.toUpperCase()}</span>
            {index === 0 && <span className="winner-badge">WINNER!</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersRank;
