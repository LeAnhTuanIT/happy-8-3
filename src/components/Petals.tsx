import React, { useEffect, useState } from 'react';

interface PetalProps {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  rotation: string;
  blur: string;
}

const Petals: React.FC = () => {
  const [petals, setPetals] = useState<PetalProps[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 15 + 10}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 10}s`,
      rotation: `${Math.random() * 360}deg`,
      blur: `${Math.random() * 2}px`,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="petals-container-3d">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal-3d"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            filter: `blur(${petal.blur})`,
            transform: `rotate(${petal.rotation})`,
          }}
        />
      ))}
    </div>
  );
};

export default Petals;
