import { useState, useEffect } from "react";

/**
 * @interface FireflyAnimationProps
 * @description Defines the props for the FireflyAnimation component.
 * @property {boolean} [isFlashing] - Whether the animation should perform a full-screen flash.
 * @property {boolean} [isConstantBlinking] - Whether the fireflies should blink in a constant, synchronized manner.
 * @property {string} [flashColor] - The color of the firefly and the flash.
 * @property {() => void} [onFlashComplete] - A callback function to be called when the flash animation is complete.
 */
interface FireflyAnimationProps {
  isFlashing?: boolean;
  isConstantBlinking?: boolean;
  flashColor?: string;
  onFlashComplete?: () => void;
}

/**
 * A component that renders a firefly animation.
 * It can display a regular dancing firefly animation, a synchronized blinking animation,
 * and a full-screen flash effect.
 * @param {FireflyAnimationProps} props - The props for the component.
 * @returns {JSX.Element} The rendered firefly animation component.
 */
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
