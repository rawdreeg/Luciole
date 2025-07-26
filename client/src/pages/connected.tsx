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
import type { Spark } from "@shared/schema";

interface ConnectedProps {
  sparkId: string;
}

export default function Connected({ sparkId }: ConnectedProps) {
  const [, setLocation] = useLocation();
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [otherUsers, setOtherUsers] = useState<Array<{ userId: string; latitude: number; longitude: number }>>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showFlashButton, setShowFlashButton] = useState(true);
  
  const { data: spark } = useQuery<Spark>({
    queryKey: [`/api/sparks/${sparkId}`],
  });

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
          // Trigger flash animation when someone else flashes
          if (message.fromUser !== userId) {
            setIsFlashing(true);
          }
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

  const handleDisconnect = () => {
    sendMessage({
      type: 'disconnect',
    });
    setLocation("/");
  };

  const handleFlash = () => {
    if (!isFlashing && isConnected) {
      setIsFlashing(true);
      setShowFlashButton(false);
      sendMessage({
        type: 'flash',
        timestamp: Date.now(),
      });
      
      // Re-enable flash button after cooldown
      setTimeout(() => {
        setShowFlashButton(true);
      }, 3000);
    }
  };

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
            onFlashComplete={handleFlashComplete}
          />
        </div>

        {/* Flash Button */}
        <div className="mb-8">
          <Button
            onClick={handleFlash}
            disabled={!showFlashButton || !isConnected}
            className={`w-24 h-24 rounded-full ${
              showFlashButton && isConnected
                ? 'bg-firefly-400 hover:bg-firefly-500 text-dark-900 active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            } transition-all duration-200 font-bold text-lg shadow-lg`}
          >
            <Zap className="w-8 h-8" />
          </Button>
          <p className="text-center text-sm text-gray-400 mt-2">
            {!showFlashButton ? 'Cooling down...' : 'Tap to flash'}
          </p>
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
