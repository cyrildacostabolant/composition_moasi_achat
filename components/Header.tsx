import React, { useRef, useEffect, useState } from 'react';
import { LOGO_BASE64_CLEAN } from '../constants';

interface HeaderProps {
  color: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  id?: string;
}

const Header: React.FC<HeaderProps> = ({ color, title, onTitleChange, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState(80);

  const REFERENCE_TEXT = "MMMMWWWWMMMMWWWW"; 

  useEffect(() => {
    const adjustFontSize = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const refWidth = measureRef.current.offsetWidth;

      if (refWidth === 0) return;

      let targetSize = (containerWidth / refWidth) * 100 * 0.92;
      targetSize = Math.min(Math.max(targetSize, 40), 130); 
      
      setFontSize(targetSize);
    };

    adjustFontSize();
    const observer = new ResizeObserver(adjustFontSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [title]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      id={id}
      className="w-full flex items-center px-8 shadow-md transition-colors duration-300 shrink-0 box-border overflow-hidden"
      style={{ backgroundColor: color, height: '140px' }}
      onClick={handleContainerClick}
    >
      {/* Logo Section */}
      <div className="flex-shrink-0 mr-10 flex items-center justify-center pointer-events-none h-full">
        <img 
          src={LOGO_BASE64_CLEAN} 
          alt="Logo" 
          className="h-32 w-32 object-contain"
          style={{ minWidth: '128px' }}
        />
      </div>

      {/* Title Section */}
      <div 
        ref={containerRef}
        className="flex-grow h-full relative cursor-text overflow-hidden"
      >
        {/* Layer 1: Hidden Measurement Span */}
        <span
            ref={measureRef}
            className="absolute invisible whitespace-nowrap font-bold uppercase font-sans pointer-events-none"
            style={{ fontSize: '100px' }}
        >
            {REFERENCE_TEXT}
        </span>

        {/* Layer 2: Visual Display - Perfect centering with Flex and Optical adjustment */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-white uppercase font-sans text-center whitespace-nowrap pointer-events-none"
          style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: 1,
              padding: '0 10px',
              // Correction optique : on remonte très légèrement (4%) pour compenser l'absence de descendantes
              transform: 'translateY(-0.04em)' 
          }}
        >
          {title || <span className="opacity-30 italic">TITRE</span>}
        </div>

        {/* Layer 3: Invisible Input - Same centering logic */}
        <div className="absolute inset-0 flex items-center justify-center">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value.slice(0, 32))}
              maxLength={32}
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent border-none outline-none text-transparent caret-white font-bold uppercase font-sans text-center p-0 m-0 h-full"
              style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: 1,
                  padding: '0 10px',
                  transform: 'translateY(-0.04em)'
              }}
            />
        </div>
      </div>
    </div>
  );
};

export default Header;