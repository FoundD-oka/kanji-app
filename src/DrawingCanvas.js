import React, { useRef, useState, useEffect, useImperativeHandle, useCallback } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = React.forwardRef(({ stage, character, components }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [randomOrder, setRandomOrder] = useState([]);

  useEffect(() => {
    // Generate a random order when components change
    setRandomOrder(Array.from({ length: components.length }, (_, i) => i).sort(() => Math.random() - 0.5));
  }, [components]);

  const drawCharacters = useCallback((context) => {
    context.font = '120px UDHituAStd-E12';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = 8; // Line width set to 8pt

    if (stage === 0) {
      // 全ての構成要素をグレーで描画
      context.fillStyle = '#E0E0E0';
      components.forEach((comp) => {
        context.fillText(comp, 150, 150);
      });
    } else {
      // stage 1以降: ランダムに画を削除し、残りを黒で描画
      const remainingStrokes = components.length - stage;
      if (remainingStrokes > 0) {
        context.fillStyle = '#000000';
        randomOrder.slice(0, remainingStrokes).forEach((index) => {
          context.fillText(components[index], 150, 150);
        });
      }
    }
  }, [components, stage, randomOrder]);

  const clearAndRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacters(context);
  }, [drawCharacters]);

  useEffect(() => {
    const loadFont = async () => {
      await document.fonts.load('120px UDHituAStd-E12');
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  useEffect(() => {
    if (fontLoaded) {
      clearAndRedraw();
    }
  }, [stage, character, components, fontLoaded, clearAndRedraw]);

  const getCoordinates = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((event) => {
    event.preventDefault();
    const { x, y } = getCoordinates(event);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = 8;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';
    setIsDrawing(true);
  }, [getCoordinates]);

  const draw = useCallback((event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { x, y } = getCoordinates(event);
    const context = canvasRef.current.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleStart = useCallback((event) => {
    if (event.type === 'mousedown' && event.button !== 0) return;
    startDrawing(event);
  }, [startDrawing]);

  const handleMove = useCallback((event) => {
    if (event.type === 'mousemove' && !isDrawing) return;
    draw(event);
  }, [draw, isDrawing]);

  const handleEnd = useCallback((event) => {
    if (event.type === 'mouseup' && event.button !== 0) return;
    stopDrawing();
  }, [stopDrawing]);

  useImperativeHandle(ref, () => ({
    clearAndRedraw,
    getCanvasImage: () => canvasRef.current
  }));

  return (
    <div className="drawing-canvas">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseOut={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

export default DrawingCanvas;