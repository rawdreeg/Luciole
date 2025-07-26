import { useState, useEffect } from "react";

interface FireflyAnimationProps {
  isFlashing?: boolean;
  isConstantBlinking?: boolean;
  flashColor?: string;
  onFlashComplete?: () => void;
}

export function FireflyAnimation({ 
  isFlashing = false, 
  isConstantBlinking = false,
  flashColor = "#FFB800",
  onFlashComplete 
}: FireflyAnimationProps) {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (isFlashing) {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
        onFlashComplete?.();
      }, 2000); // Flash for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isFlashing, onFlashComplete]);

  return (
    <>
      {/* Regular firefly animation */}
      <div className="w-32 h-32 mx-auto relative">
        <div 
          className={`absolute inset-0 rounded-full animate-firefly-dance opacity-80 ${
            isConstantBlinking ? 'animate-synchronized-blink' : ''
          }`}
          style={{ backgroundColor: flashColor }}
        ></div>
        <div 
          className={`absolute inset-2 rounded-full animate-firefly-dance ${
            isConstantBlinking ? 'animate-synchronized-blink' : ''
          }`}
          style={{ 
            backgroundColor: flashColor,
            animationDelay: '0.5s',
            filter: 'brightness(0.8)'
          }}
        ></div>
        <div 
          className={`absolute inset-6 rounded-full animate-firefly-dance ${
            isConstantBlinking ? 'animate-synchronized-blink' : ''
          }`}
          style={{ 
            backgroundColor: '#FFF8DC',
            animationDelay: '1s'
          }}
        ></div>
      </div>

      {/* Full-screen flash overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div 
            className="w-full h-full animate-screen-flash"
            style={{ backgroundColor: flashColor }}
          ></div>
        </div>
      )}
    </>
  );
}
