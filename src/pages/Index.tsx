import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type Screen = 'menu' | 'characters' | 'game' | 'leaderboard' | 'achievements' | 'rules';

interface Character {
  id: number;
  name: string;
  emoji: string;
  speed: number;
  jump: number;
  special: string;
}

interface Obstacle {
  x: number;
  type: 'spike' | 'hole' | 'wall';
}

interface Cookie {
  x: number;
  collected: boolean;
}

const characters: Character[] = [
  { id: 1, name: 'Choco Cookie', emoji: '🍪', speed: 5, jump: 8, special: 'Double Jump' },
  { id: 2, name: 'Strawberry', emoji: '🍓', speed: 7, jump: 6, special: 'Speed Boost' },
  { id: 3, name: 'Vanilla', emoji: '🥛', speed: 4, jump: 10, special: 'High Jump' },
  { id: 4, name: 'Mint Choco', emoji: '🍬', speed: 8, jump: 7, special: 'Shield' },
];

const achievements = [
  { id: 1, name: 'First Steps', desc: 'Run 100 meters', icon: '👟', unlocked: true },
  { id: 2, name: 'Cookie Collector', desc: 'Collect 50 cookies', icon: '🍪', unlocked: true },
  { id: 3, name: 'Speed Demon', desc: 'Reach 1000m', icon: '⚡', unlocked: false },
  { id: 4, name: 'Perfect Run', desc: 'Run without damage', icon: '⭐', unlocked: false },
  { id: 5, name: 'Master Runner', desc: 'Reach 5000m', icon: '🏆', unlocked: false },
];

const leaderboard = [
  { rank: 1, name: 'CookieMaster', score: 8500 },
  { rank: 2, name: 'SpeedRunner99', score: 7200 },
  { rank: 3, name: 'PixelPro', score: 6800 },
  { rank: 4, name: 'RetroGamer', score: 5400 },
  { rank: 5, name: 'SweetTooth', score: 4900 },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedChar, setSelectedChar] = useState<Character>(characters[0]);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [cookies, setCookies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [playerY, setPlayerY] = useState(200);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [cookieItems, setCookieItems] = useState<Cookie[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setDistance(0);
    setCookies(0);
    setPlayerY(200);
    setVelocityY(0);
    setObstacles([]);
    setCookieItems([]);
    setScreen('game');
  };

  const jump = () => {
    if (!isJumping && playerY >= 200) {
      setVelocityY(-15);
      setIsJumping(true);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isJumping, playerY]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    gameLoopRef.current = requestAnimationFrame(function gameLoop() {
      setVelocityY(prev => prev + 0.8);
      setPlayerY(prev => {
        const newY = prev + velocityY;
        if (newY >= 200) {
          setIsJumping(false);
          return 200;
        }
        return newY;
      });

      setDistance(prev => prev + 1);
      setScore(prev => prev + 1);

      if (Math.random() < 0.02) {
        setObstacles(prev => [...prev, { 
          x: 800, 
          type: ['spike', 'hole', 'wall'][Math.floor(Math.random() * 3)] as any 
        }]);
      }

      if (Math.random() < 0.03) {
        setCookieItems(prev => [...prev, { x: 800, collected: false }]);
      }

      setObstacles(prev => 
        prev.map(obs => ({ ...obs, x: obs.x - 5 - selectedChar.speed }))
          .filter(obs => obs.x > -50)
      );

      setCookieItems(prev => 
        prev.map(c => ({ ...c, x: c.x - 5 - selectedChar.speed }))
          .filter(c => c.x > -50)
      );

      obstacles.forEach(obs => {
        if (obs.x > 30 && obs.x < 90 && playerY >= 180) {
          setGameOver(true);
          setIsPlaying(false);
        }
      });

      cookieItems.forEach((c, idx) => {
        if (!c.collected && c.x > 30 && c.x < 90) {
          setCookies(prev => prev + 1);
          setScore(prev => prev + 10);
          setCookieItems(prev => {
            const updated = [...prev];
            updated[idx].collected = true;
            return updated;
          });
        }
      });

      if (isPlaying && !gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    });

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, velocityY, playerY, selectedChar.speed]);

  const renderMenu = () => (
    <div className="min-h-screen gradient-pink-gold flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-bounce-pixel">
        <h1 className="text-4xl md:text-6xl text-stroke text-white mb-4">
          COOKIE RUN
        </h1>
        <p className="text-xs md:text-sm text-cookie-chocolate">PIXEL EDITION</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        <Button 
          onClick={() => setScreen('characters')}
          className="h-20 text-xs bg-white hover:bg-cookie-cream border-4 border-cookie-chocolate text-cookie-chocolate pixel-border"
        >
          <Icon name="Users" className="mr-2" size={16} />
          ПЕРСОНАЖИ
        </Button>
        
        <Button 
          onClick={startGame}
          className="h-20 text-xs gradient-pink-gold hover:opacity-90 border-4 border-cookie-chocolate text-white pixel-border animate-pulse-glow"
        >
          <Icon name="Play" className="mr-2" size={16} />
          ИГРАТЬ
        </Button>
        
        <Button 
          onClick={() => setScreen('leaderboard')}
          className="h-20 text-xs bg-cookie-blue hover:bg-cookie-blue/90 border-4 border-cookie-chocolate text-white pixel-border"
        >
          <Icon name="Trophy" className="mr-2" size={16} />
          РЕЙТИНГ
        </Button>
        
        <Button 
          onClick={() => setScreen('achievements')}
          className="h-20 text-xs bg-cookie-gold hover:bg-cookie-gold/90 border-4 border-cookie-chocolate text-cookie-chocolate pixel-border"
        >
          <Icon name="Award" className="mr-2" size={16} />
          НАГРАДЫ
        </Button>

        <Button 
          onClick={() => setScreen('rules')}
          className="h-20 text-xs col-span-2 bg-cookie-strawberry hover:bg-cookie-strawberry/90 border-4 border-cookie-chocolate text-white pixel-border"
        >
          <Icon name="BookOpen" className="mr-2" size={16} />
          ПРАВИЛА
        </Button>
      </div>

      <div className="mt-8 text-cookie-chocolate text-[8px]">
        🍪 PRESS START TO BEGIN 🍪
      </div>
    </div>
  );

  const renderCharacters = () => (
    <div className="min-h-screen bg-cookie-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-stroke text-cookie-chocolate">ПЕРСОНАЖИ</h2>
          <Button 
            onClick={() => setScreen('menu')}
            variant="outline"
            size="sm"
            className="border-4 border-cookie-chocolate pixel-border text-[8px]"
          >
            <Icon name="ArrowLeft" size={12} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map(char => (
            <Card 
              key={char.id}
              className={`p-6 border-4 border-cookie-chocolate cursor-pointer transition-transform hover:scale-105 ${
                selectedChar.id === char.id ? 'bg-cookie-gold' : 'bg-white'
              }`}
              onClick={() => setSelectedChar(char)}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{char.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-sm mb-2 text-cookie-chocolate">{char.name}</h3>
                  <div className="space-y-1 text-[8px]">
                    <div className="flex justify-between">
                      <span>SPEED</span>
                      <Progress value={char.speed * 10} className="w-20 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span>JUMP</span>
                      <Progress value={char.jump * 10} className="w-20 h-2" />
                    </div>
                  </div>
                  <Badge className="mt-2 text-[6px] bg-cookie-pink text-white">
                    {char.special}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button 
          onClick={startGame}
          className="w-full mt-6 h-16 gradient-pink-gold text-white border-4 border-cookie-chocolate pixel-border"
        >
          НАЧАТЬ С {selectedChar.name.toUpperCase()}
        </Button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen bg-cookie-blue flex flex-col">
      <div className="bg-cookie-chocolate text-white p-2 flex justify-between text-[8px] border-b-4 border-cookie-pink">
        <div>SCORE: {score}</div>
        <div>DISTANCE: {distance}m</div>
        <div>🍪 {cookies}</div>
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-cookie-blue to-cookie-cream"
        onClick={jump}
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-cookie-chocolate"></div>
        
        <div 
          className="absolute text-4xl transition-none"
          style={{ 
            left: '60px', 
            top: `${playerY}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {selectedChar.emoji}
        </div>

        {obstacles.map((obs, idx) => (
          <div 
            key={idx}
            className="absolute bottom-32 text-2xl"
            style={{ left: `${obs.x}px` }}
          >
            {obs.type === 'spike' && '🔺'}
            {obs.type === 'hole' && '🕳️'}
            {obs.type === 'wall' && '🧱'}
          </div>
        ))}

        {cookieItems.map((c, idx) => (
          !c.collected && (
            <div 
              key={idx}
              className="absolute text-2xl animate-bounce-pixel"
              style={{ left: `${c.x}px`, top: '150px' }}
            >
              🍪
            </div>
          )
        ))}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="p-8 border-4 border-cookie-chocolate bg-white text-center">
              <h2 className="text-2xl mb-4 text-stroke text-cookie-strawberry">GAME OVER</h2>
              <div className="text-[10px] space-y-2 mb-6">
                <p>SCORE: {score}</p>
                <p>DISTANCE: {distance}m</p>
                <p>COOKIES: {cookies} 🍪</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={startGame}
                  className="gradient-pink-gold text-white text-[8px] border-2 border-cookie-chocolate"
                >
                  RETRY
                </Button>
                <Button 
                  onClick={() => setScreen('menu')}
                  variant="outline"
                  className="text-[8px] border-2 border-cookie-chocolate"
                >
                  MENU
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="bg-cookie-chocolate text-white p-2 text-center text-[8px]">
        PRESS SPACE OR TAP TO JUMP
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-cookie-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-stroke text-cookie-chocolate">РЕЙТИНГ</h2>
          <Button 
            onClick={() => setScreen('menu')}
            variant="outline"
            size="sm"
            className="border-4 border-cookie-chocolate pixel-border text-[8px]"
          >
            <Icon name="ArrowLeft" size={12} />
          </Button>
        </div>

        <div className="space-y-2">
          {leaderboard.map(entry => (
            <Card 
              key={entry.rank}
              className="p-4 border-4 border-cookie-chocolate bg-white flex items-center gap-4"
            >
              <div className={`text-2xl ${entry.rank <= 3 ? 'animate-pulse-glow' : ''}`}>
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && `#${entry.rank}`}
              </div>
              <div className="flex-1 text-xs text-cookie-chocolate">{entry.name}</div>
              <div className="text-xs font-bold text-cookie-pink">{entry.score}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="min-h-screen bg-cookie-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-stroke text-cookie-chocolate">ДОСТИЖЕНИЯ</h2>
          <Button 
            onClick={() => setScreen('menu')}
            variant="outline"
            size="sm"
            className="border-4 border-cookie-chocolate pixel-border text-[8px]"
          >
            <Icon name="ArrowLeft" size={12} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(ach => (
            <Card 
              key={ach.id}
              className={`p-4 border-4 border-cookie-chocolate ${
                ach.unlocked ? 'bg-cookie-gold' : 'bg-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{ach.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xs mb-1 text-cookie-chocolate">{ach.name}</h3>
                  <p className="text-[8px] text-cookie-chocolate/70">{ach.desc}</p>
                  {ach.unlocked && (
                    <Badge className="mt-2 text-[6px] bg-cookie-pink text-white">
                      UNLOCKED
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="min-h-screen bg-cookie-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-stroke text-cookie-chocolate">ПРАВИЛА</h2>
          <Button 
            onClick={() => setScreen('menu')}
            variant="outline"
            size="sm"
            className="border-4 border-cookie-chocolate pixel-border text-[8px]"
          >
            <Icon name="ArrowLeft" size={12} />
          </Button>
        </div>

        <Card className="p-6 border-4 border-cookie-chocolate bg-white">
          <div className="space-y-4 text-[10px] text-cookie-chocolate">
            <div>
              <h3 className="text-sm mb-2 text-cookie-pink">🎮 УПРАВЛЕНИЕ</h3>
              <p>Нажми ПРОБЕЛ или коснись экрана, чтобы прыгнуть</p>
            </div>

            <div>
              <h3 className="text-sm mb-2 text-cookie-pink">🍪 ЦЕЛЬ ИГРЫ</h3>
              <p>Беги как можно дальше, собирай печеньки и избегай препятствий</p>
            </div>

            <div>
              <h3 className="text-sm mb-2 text-cookie-pink">⚡ ПРЕПЯТСТВИЯ</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>🔺 Шипы - прыгай через них</li>
                <li>🕳️ Ямы - перепрыгивай</li>
                <li>🧱 Стены - вовремя взлетай</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm mb-2 text-cookie-pink">🏆 ОЧКИ</h3>
              <p>+1 очко за каждый метр пути</p>
              <p>+10 очков за каждую собранную печеньку</p>
            </div>

            <div>
              <h3 className="text-sm mb-2 text-cookie-pink">👾 ПЕРСОНАЖИ</h3>
              <p>Каждый персонаж имеет уникальные характеристики скорости и прыжка</p>
            </div>
          </div>
        </Card>

        <Button 
          onClick={startGame}
          className="w-full mt-6 h-16 gradient-pink-gold text-white border-4 border-cookie-chocolate pixel-border"
        >
          НАЧАТЬ ИГРУ
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {screen === 'menu' && renderMenu()}
      {screen === 'characters' && renderCharacters()}
      {screen === 'game' && renderGame()}
      {screen === 'leaderboard' && renderLeaderboard()}
      {screen === 'achievements' && renderAchievements()}
      {screen === 'rules' && renderRules()}
    </>
  );
}
