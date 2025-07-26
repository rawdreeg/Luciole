import { useState, useEffect } from "react";

interface FireflyAnimationProps {
  isFlashing?: boolean;
  onFlashComplete?: () => void;
}

export function FireflyAnimation({ isFlashing = false, onFlashComplete }: FireflyAnimationProps) {
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
        <div className="absolute inset-0 bg-firefly-400 rounded-full animate-firefly-dance opacity-80"></div>
        <div 
          className="absolute inset-2 bg-firefly-500 rounded-full animate-firefly-dance"
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div 
          className="absolute inset-6 bg-firefly-50 rounded-full animate-firefly-dance"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Full-screen flash overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="w-full h-full bg-firefly-400 animate-screen-flash"></div>
        </div>
      )}
    </>
  );
}
