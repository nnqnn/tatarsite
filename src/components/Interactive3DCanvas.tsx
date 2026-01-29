import React, { useRef, useEffect, useState } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  start: number;
  end: number;
}

const Interactive3DCanvas: React.FC<{ shape: string }> = ({ shape }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Определение точек для разных фигур
  const getShapeData = (shapeType: string) => {
    switch (shapeType) {
      case 'cube':
        return {
          vertices: [
            { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
            { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
            { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
          ],
          edges: [
            { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 0 },
            { start: 4, end: 5 }, { start: 5, end: 6 }, { start: 6, end: 7 }, { start: 7, end: 4 },
            { start: 0, end: 4 }, { start: 1, end: 5 }, { start: 2, end: 6 }, { start: 3, end: 7 }
          ]
        };
      case 'pyramid':
        return {
          vertices: [
            { x: 0, y: -1, z: 0 },
            { x: -1, y: 1, z: -1 }, { x: 1, y: 1, z: -1 },
            { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
          ],
          edges: [
            { start: 0, end: 1 }, { start: 0, end: 2 }, { start: 0, end: 3 }, { start: 0, end: 4 },
            { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 4 }, { start: 4, end: 1 }
          ]
        };
      default:
        return {
          vertices: [
            { x: -1, y: -1, z: 0 }, { x: 1, y: -1, z: 0 },
            { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }
          ],
          edges: [
            { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 0 }
          ]
        };
    }
  };

  // Матричные операции для 3D трансформаций
  const rotateX = (point: Point3D, angle: number): Point3D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x,
      y: point.y * cos - point.z * sin,
      z: point.y * sin + point.z * cos
    };
  };

  const rotateY = (point: Point3D, angle: number): Point3D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos + point.z * sin,
      y: point.y,
      z: -point.x * sin + point.z * cos
    };
  };

  // Проекция 3D точки на 2D экран
  const project = (point: Point3D, width: number, height: number): { x: number; y: number } => {
    const distance = 5;
    const factor = distance / (distance + point.z);
    return {
      x: width / 2 + point.x * 100 * factor,
      y: height / 2 + point.y * 100 * factor
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const { vertices, edges } = getShapeData(shape);

    // Применяем вращения к каждой вершине
    const rotatedVertices = vertices.map(vertex => {
      let rotated = rotateY(vertex, rotation.y);
      rotated = rotateX(rotated, rotation.x);
      return rotated;
    });

    // Проецируем 3D точки на 2D экран
    const projectedVertices = rotatedVertices.map(vertex => 
      project(vertex, width, height)
    );

    // Рисуем рёбра
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const start = projectedVertices[edge.start];
      const end = projectedVertices[edge.end];
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    // Рисуем вершины
    ctx.fillStyle = '#ef4444';
    projectedVertices.forEach(vertex => {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  useEffect(() => {
    draw();
  }, [rotation, shape]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="border border-border rounded-lg cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default Interactive3DCanvas;