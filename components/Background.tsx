
import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const stars: { x: number; y: number; z: number; size: number }[] = [];

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < 400; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
          size: Math.random() * 2,
        });
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.z -= 0.5;
        if (star.z <= 0) star.z = canvas.width;

        const k = 128 / star.z;
        const px = (star.x - canvas.width / 2) * k + canvas.width / 2;
        const py = (star.y - canvas.height / 2) * k + canvas.height / 2;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * star.size;
          const opacity = 1 - star.z / canvas.width;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default Background;
