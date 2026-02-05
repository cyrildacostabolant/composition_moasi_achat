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
  const [fontSize, setFontSize] = useState(40);

  // Chaîne de référence pour garantir que 32 caractères tiennent toujours
  // On utilise un mélange réaliste pour la mesure de sécurité
  const REFERENCE_TEXT = "MMMMWWWWMMMMWWWWMMMMWWWWMMMMWWWW"; 

  useEffect(() => {
    const adjustFontSize = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const refWidth = measureRef.current.offsetWidth;

      if (refWidth === 0) return;

      // Augmentation du ratio à 98% pour réduire les marges latérales
      let targetSize = (containerWidth / refWidth) * 100 * 0.98;
      
      // Augmentation du plafond à 90px (pour un bandeau de 140px, c'est bien plus impactant)
      targetSize = Math.min(Math.max(targetSize, 24), 90); 
      
      setFontSize(targetSize);
    };

    adjustFontSize();
    const observer = new ResizeObserver(adjustFontSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      id={id}
      className="w-full flex items-center px-8 shadow-md transition-colors duration-300 overflow-hidden shrink-0 box-border"
      style={{ backgroundColor: color, height: '140px' }}
      onClick={handleContainerClick}
    >
      {/* Logo Section - Position fixe à gauche */}
      <div className="flex-shrink-0 mr-6 flex items-center justify-center pointer-events-none">
        <img 
          src={LOGO_BASE64_CLEAN} 
          alt="Logo" 
          className="h-32 w-32 object-contain"
          style={{ minWidth: '128px' }}
        />
      </div>

      {/* Title Section - Centrage horizontal et vertical avec marges réduites */}
      <div 
        ref={containerRef}
        className="flex-grow h-full flex items-center justify-center relative cursor-text overflow-hidden"
      >
        {/* Layer 1: Hidden Measurement Span */}
        <span
            ref={measureRef}
            className="absolute invisible whitespace-nowrap font-bold uppercase font-sans pointer-events-none"
            style={{ fontSize: '100px' }}
        >
            {REFERENCE_TEXT}
        </span>

        {/* Layer 2: Visual Display - Taille de police augmentée */}
        <div
          className="w-full font-bold text-white uppercase font-sans text-center whitespace-nowrap overflow-hidden"
          style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: '1.1', // Ajusté pour un texte plus gros
              padding: '0 5px' // Marge minimale
          }}
        >
          {title || <span className="opacity-30">ENTREZ LE TITRE...</span>}
        </div>

        {/* Layer 3: Invisible Input - Superposé avec text-align center */}
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value.slice(0, 32))}
          maxLength={32}
          spellCheck={false}
          autoComplete="off"
          className="absolute inset-0 w-full bg-transparent border-none outline-none text-transparent caret-white font-bold uppercase font-sans text-center p-0 m-0"
          style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: '140px' 
          }}
        />
      </div>
    </div>
  );
};

export default Header;