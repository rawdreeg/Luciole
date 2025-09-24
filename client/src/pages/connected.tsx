import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, MapPin, Zap } from "lucide-react";
import { ProximityDisplay } from "@/components/proximity-display";
import { FireflyAnimation } from "@/components/firefly-animation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useGeolocation } from "@/hooks/use-geolocation";
import { calculateDistance } from "@/lib/distance";
import type { Spark } from "@shared/zod";

/**
 * @interface ConnectedProps
 * @description Defines the props for the Connected component.
 * @property {string} sparkId - The ID of the spark the user is connected to.
 */
interface ConnectedProps {
  sparkId: string;
}

/**
 * The page for a user who is connected to a spark.
 * It displays the spark ID, a proximity display of other users, and controls
 * for flashing and synchronization.
 * @param {ConnectedProps} props - The props for the component.
 * @returns {JSX.Element} The rendered connected page.
 */
export default function Connected({ sparkId }: ConnectedProps) {
  const [, setLocation] = useLocation();
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [otherUsers, setOtherUsers] = useState<Array<{ userId: string; latitude: number; longitude: number }>>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isConstantBlinking, setIsConstantBlinking] = useState(false);
  const [flashColor, setFlashColor] = useState("#FFB800");
  const [showFlashButton, setShowFlashButton] = useState(true);
  
  const { data: spark } = useQuery<Spark>({
    queryKey: [`/api/sparks/${sparkId}`],
  });

  // Set flash color from spark data
  useEffect(() => {
    if (spark?.flashColor) {
      setFlashColor(spark.flashColor);
    }
  }, [spark]);

  const { latitude, longitude, error: locationError } = useGeolocation();
  
  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (message) => {
      console.log("Connected page received message:", message);
      switch (message.type) {
        case 'location_update':
          console.log("Location update received:", message.otherUsers);
          setOtherUsers(message.otherUsers.filter((u: any) => u.userId !== userId && u.latitude && u.longitude));
          break;
        case 'user_joined':
          console.log("User joined:", message.userId);
          // Refetch connections when someone joins
          break;
        case 'flash_signal':
          console.log("Flash signal received from:", message.fromUser);
          // Trigger flash animation when someone flashes
          if (message.synchronized || message.fromUser !== userId) {
            setFlashColor(message.color || "#FFB800");
            setIsFlashing(true);
          }
          break;
        case 'start_constant_blink_signal':
          console.log("Start constant blink signal received from:", message.fromUser);
          setFlashColor(message.color || "#FFB800");
          setIsConstantBlinking(true);
          break;
        case 'stop_constant_blink_signal':
          console.log("Stop constant blink signal received from:", message.fromUser);
          setIsConstantBlinking(false);
          break;
        case 'sync_signal':
          // Check if users are close enough to sync (within 10 meters)
          if (otherUsers.length > 0 && latitude && longitude) {
            const closestUser = otherUsers[0];
            if (closestUser.latitude && closestUser.longitude) {
              const distance = calculateDistance(
                latitude,
                longitude,
                closestUser.latitude,
                closestUser.longitude
              );
              console.log("Distance calculated:", distance);
              if (distance <= 10) {
                setLocation(`/sync/${sparkId}`);
              }
            }
          }
          break;
      }
    },
  });

  // Join the spark when component mounts
  useEffect(() => {
    if (isConnected && sparkId && userId) {
      sendMessage({
        type: 'join',
        sparkId,
        userId,
      });
    }
  }, [isConnected, sparkId, userId, sendMessage]);

  // Send location updates
  useEffect(() => {
    if (isConnected && latitude && longitude) {
      sendMessage({
        type: 'location',
        latitude,
        longitude,
      });
    }
  }, [isConnected, latitude, longitude, sendMessage]);

  // Send sync signals periodically
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        sendMessage({
          type: 'sync',
          timestamp: Date.now(),
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isConnected, sendMessage]);

  /**
   * Handles disconnecting from the spark.
   */
  const handleDisconnect = () => {
    sendMessage({
      type: 'disconnect',
    });
    setLocation("/");
  };

  /**
   * Toggles the flash or constant blinking.
   */
  const handleFlashToggle = () => {
    if (!isConnected) return;
    
    if (isConstantBlinking) {
      // Stop constant blinking
      setIsConstantBlinking(false);
      sendMessage({
        type: 'stop_constant_blink',
        timestamp: Date.now(),
      });
    } else if (!isFlashing && showFlashButton) {
      // Start single flash or constant blinking based on press duration
      setIsFlashing(true);
      setShowFlashButton(false);
      sendMessage({
        type: 'flash',
        timestamp: Date.now(),
        synchronized: true,
      });
      
      // Re-enable flash button after cooldown
      setTimeout(() => {
        setShowFlashButton(true);
      }, 3000);
    }
  };

  /**
   * Handles a long press on the flash button to start constant blinking.
   */
  const handleLongPress = () => {
    if (!isConnected || isConstantBlinking) return;
    
    // Start constant blinking on long press
    setIsConstantBlinking(true);
    sendMessage({
      type: 'start_constant_blink',
      timestamp: Date.now(),
    });
  };

  /**
   * Handles the completion of the flash animation.
   */
  const handleFlashComplete = () => {
    setIsFlashing(false);
  };

  const distance = otherUsers.length > 0 && latitude && longitude && otherUsers[0].latitude && otherUsers[0].longitude
    ? calculateDistance(latitude, longitude, otherUsers[0].latitude, otherUsers[0].longitude)
    : null;

  if (!spark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-firefly-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-5 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Connected</span>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 -mt-16">
        <div className="text-center mb-12">
          <h2 className="text-xl font-semibold text-firefly-50 mb-4">
            Looking for each other...
          </h2>
          <p className="text-gray-300 mb-8">Move closer to sync your lights</p>
        </div>

        {/* Firefly Animation */}
        <div className="mb-8">
          <FireflyAnimation 
            isFlashing={isFlashing}
            isConstantBlinking={isConstantBlinking}
            flashColor={flashColor}
            onFlashComplete={handleFlashComplete}
          />
        </div>

        {/* Flash Control */}
        <div className="mb-8 flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <Button
              onClick={handleFlashToggle}
              onMouseDown={() => {
                // Start timer for long press
                const timer = setTimeout(handleLongPress, 1000);
                const cleanup = () => {
                  clearTimeout(timer);
                  document.removeEventListener('mouseup', cleanup);
                  document.removeEventListener('touchend', cleanup);
                };
                document.addEventListener('mouseup', cleanup);
                document.addEventListener('touchend', cleanup);
              }}
              disabled={(!showFlashButton && !isConstantBlinking) || !isConnected}
              className={`w-24 h-24 rounded-full transition-all duration-200 font-bold text-lg shadow-lg ${
                isConstantBlinking 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : showFlashButton && isConnected
                    ? 'hover:scale-105 text-dark-900 active:scale-95'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              style={{ 
                backgroundColor: isConstantBlinking ? '#ef4444' : (showFlashButton && isConnected ? flashColor : '#4b5563')
              }}
            >
              <Zap className="w-8 h-8" />
            </Button>
            <div className="text-center text-sm text-gray-400 mt-2">
              {isConstantBlinking ? (
                <div className="text-red-400 animate-pulse">
                  <div className="font-semibold">Constant blinking active</div>
                  <div>Tap to stop</div>
                </div>
              ) : !showFlashButton ? (
                'Cooling down...'
              ) : (
                <div>
                  <div>Tap: Flash all devices</div>
                  <div className="text-xs text-gray-500">Hold: Start constant blink</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proximity Display */}
        <div className="w-full max-w-sm mb-12">
          <ProximityDisplay
            userPosition={latitude && longitude ? { latitude, longitude } : null}
            otherUsers={otherUsers}
          />

          {/* Distance Info */}
          <div className="text-center mt-8">
            <p className="text-3xl font-bold text-firefly-400 mb-2">
              {distance ? `${Math.round(distance)} m` : "---"}
            </p>
            <p className="text-sm text-gray-400">Distance apart</p>
          </div>
        </div>

        {/* Location Status */}
        <Card className="glass-card rounded-2xl w-full max-w-sm border-firefly-400/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className={`w-5 h-5 ${locationError ? 'text-red-400' : 'text-green-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-firefly-50">Location Sharing</p>
                <p className="text-xs text-gray-400">
                  {locationError ? 'Location access required' : 'Enabled for precise positioning'}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${locationError ? 'bg-red-400' : 'bg-green-400'}`}></div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
