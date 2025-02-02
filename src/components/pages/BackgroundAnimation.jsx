import React, { useEffect, useState, useCallback } from 'react';

const BackgroundAnimation = () => {
  const [shapes, setShapes] = useState([]);
  const [lines, setLines] = useState([]);

  const colors = [
    'rgba(34, 211, 238, 0.6)', // cyan
    'rgba(59, 130, 246, 0.6)', // blue
    'rgba(255, 255, 255, 0.6)', // white
    'rgba(147, 197, 253, 0.6)', // light blue
  ];

  // Cria uma nova forma com propriedades aleatórias
  const createShape = useCallback(() => {
    const shapeTypes = ['circle', 'square', 'triangle', 'diamond'];
    const size = Math.random() * 4 + 2; // Tamanho entre 2 e 6
    
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2, // Velocidade X aumentada
      vy: (Math.random() - 0.5) * 2, // Velocidade Y aumentada
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      id: Math.random()
    };
  }, []);

  // Gera o path SVG para diferentes formas
  const getShapePath = useCallback((shape) => {
    const size = shape.size * (1 + Math.sin(shape.pulsePhase) * 0.2); // Efeito de pulsação

    switch (shape.type) {
      case 'square':
        return `M${-size},${-size} L${size},${-size} L${size},${size} L${-size},${size} Z`;
      case 'triangle':
        return `M0,${-size} L${size},${size} L${-size},${size} Z`;
      case 'diamond':
        return `M0,${-size} L${size},0 L0,${size} L${-size},0 Z`;
      default:
        return ''; // Círculos são tratados separadamente
    }
  }, []);

  // Inicializa as formas
  useEffect(() => {
    const initialShapes = Array.from({ length: 20 }, createShape);
    setShapes(initialShapes);
  }, [createShape]);

  // Atualiza as posições e estados das formas
  useEffect(() => {
    const updateShapes = () => {
      setShapes(prevShapes => {
        return prevShapes.map(shape => {
          // Adiciona aleatoriedade ao movimento
          const randomAccel = {
            x: (Math.random() - 0.5) * 0.1,
            y: (Math.random() - 0.5) * 0.1
          };

          let newX = shape.x + shape.vx;
          let newY = shape.y + shape.vy;
          let newVx = shape.vx + randomAccel.x;
          let newVy = shape.vy + randomAccel.y;

          // Limita a velocidade máxima
          const maxSpeed = 3;
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed;
            newVy = (newVy / speed) * maxSpeed;
          }

          // Verifica colisão com as bordas
          if (newX < 0 || newX > window.innerWidth) newVx *= -1;
          if (newY < 0 || newY > window.innerHeight) newVy *= -1;

          return {
            ...shape,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: (shape.rotation + shape.rotationSpeed) % 360,
            pulsePhase: shape.pulsePhase + 0.05
          };
        });
      });

      // Atualiza as linhas entre formas próximas
      const newLines = [];
      shapes.forEach((shape1, i) => {
        shapes.slice(i + 1).forEach(shape2 => {
          const distance = Math.hypot(shape1.x - shape2.x, shape1.y - shape2.y);
          if (distance < 250) {
            newLines.push({
              x1: shape1.x,
              y1: shape1.y,
              x2: shape2.x,
              y2: shape2.y,
              opacity: (1 - distance / 250) * 0.6,
              gradient: [shape1.color, shape2.color]
            });
          }
        });
      });
      setLines(newLines);
    };

    const animationFrame = requestAnimationFrame(updateShapes);
    return () => cancelAnimationFrame(animationFrame);
  }, [shapes]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          {lines.map((line, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`line-gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" style={{ stopColor: line.gradient[0] }} />
              <stop offset="100%" style={{ stopColor: line.gradient[1] }} />
            </linearGradient>
          ))}
        </defs>

        {/* Linhas com gradientes */}
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`url(#line-gradient-${index})`}
            strokeWidth="0.5"
            opacity={line.opacity}
          />
        ))}
        
        {/* Formas */}
        {shapes.map(shape => (
          <g
            key={shape.id}
            transform={`translate(${shape.x},${shape.y}) rotate(${shape.rotation})`}
          >
            {shape.type === 'circle' ? (
              <circle
                r={shape.size * (1 + Math.sin(shape.pulsePhase) * 0.2)}
                fill={shape.color}
              />
            ) : (
              <path
                d={getShapePath(shape)}
                fill={shape.color}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default BackgroundAnimation;