import React, { useState } from 'react';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number;
}

export function SplitView({ left, right, defaultRatio = 60 }: SplitViewProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.getElementById('split-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain ratio between 30% and 70%
    if (newRatio >= 30 && newRatio <= 70) {
      setRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div id="split-container" className="flex h-full w-full">
      <div
        className="overflow-auto"
        style={{ width: `${ratio}%` }}
      >
        {left}
      </div>

      <div
        className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${
          isDragging ? 'bg-gray-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      <div
        className="overflow-auto bg-gray-50"
        style={{ width: `${100 - ratio}%` }}
      >
        {right}
      </div>
    </div>
  );
}
