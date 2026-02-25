import { useEffect, useState } from 'react';

interface SanityMeterProps {
  level: number;
  timePlayed: number;
}

export default function SanityMeter({ level, timePlayed }: SanityMeterProps) {
  const [sanity, setSanity] = useState(100);
  const [score, setScore] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Sanity decreases with level and time
    const base = Math.max(0, 100 - (level - 1) * 18 - Math.floor(timePlayed / 8));
    const jitter = Math.random() > 0.9 ? Math.floor(Math.random() * 15) : 0;
    setSanity(Math.max(0, Math.min(100, base - jitter)));

    // Fake score that makes no sense
    setScore(prev => prev + Math.floor(Math.random() * 137) + 1);

    // Random glitch
    if (Math.random() > 0.85) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }
  }, [level, timePlayed]);

  const sanityColor = sanity > 60 ? 'text-secondary' : sanity > 30 ? 'text-cyber-yellow' : 'text-destructive';
  const barWidth = `${sanity}%`;
  const barColor = sanity > 60 ? 'bg-secondary' : sanity > 30 ? 'bg-cyber-yellow' : 'bg-destructive';

  return (
    <div className={`flex items-center gap-8 font-mono text-sm ${glitch ? 'glitch-text' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">SCORE:</span>
        <span className="text-primary font-bold">{score.toString().padStart(6, '0')}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">SANITY:</span>
        <div className="w-32 h-3 bg-muted rounded-sm overflow-hidden border border-border">
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: barWidth }}
          />
        </div>
        <span className={`font-bold ${sanityColor}`}>{sanity}%</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">LEVEL:</span>
        <span className="text-primary font-bold">{level}/5</span>
      </div>
    </div>
  );
}
