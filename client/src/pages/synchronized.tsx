import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Check, Heart } from "lucide-react";

/**
 * @interface SynchronizedProps
 * @description Defines the props for the Synchronized component.
 * @property {string} sparkId - The ID of the spark the user is synchronized with.
 */
interface SynchronizedProps {
  sparkId: string;
}

/**
 * The page displayed when users are synchronized.
 * It shows a success message, synchronized animation, and options to complete or start a new spark.
 * @param {SynchronizedProps} props - The props for the component.
 * @returns {JSX.Element} The rendered synchronized page.
 */
export default function Synchronized({ sparkId }: SynchronizedProps) {
  const [, setLocation] = useLocation();
  const [syncAccuracy] = useState(Math.floor(Math.random() * 5) + 95); // 95-99%
  const [finalDistance] = useState((Math.random() * 3 + 1).toFixed(1)); // 1-4m

  // Vibration effect when synchronized
  useEffect(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  /**
   * Handles disconnecting and returning to the home page.
   */
  const handleDisconnect = () => {
    setLocation("/");
  };

  /**
   * Handles starting a new spark and returning to the home page.
   */
  const handleNewSpark = () => {
    setLocation("/");
  };

  /**
   * Handles completing the synchronization and returning to the home page.
   */
  const handleComplete = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      {/* Header */}
      <header className="p-5 pt-12 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-firefly-400 rounded-full animate-synchronized-blink"></div>
            <span className="text-sm text-firefly-50 font-medium">Synchronized</span>
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
      <main className="flex-1 flex flex-col items-center justify-center px-5 -mt-16 relative">
        {/* Full screen synchronized light effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-firefly-400 rounded-full animate-synchronized-blink opacity-20 blur-3xl"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto relative">
              <div className="absolute inset-0 bg-firefly-400 rounded-full animate-synchronized-blink"></div>
              <div 
                className="absolute inset-8 bg-firefly-50 rounded-full animate-synchronized-blink flex items-center justify-center"
                style={{ animationDelay: '0.1s' }}
              >
                <Heart className="w-16 h-16 text-firefly-400 animate-synchronized-blink" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-firefly-50 mb-4">
            You Found Each Other!
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Your lights are perfectly synchronized
          </p>

          {/* Proximity Stats */}
          <Card className="glass-card rounded-2xl p-6 max-w-sm mx-auto border-firefly-400/20">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-firefly-400">{finalDistance} m</p>
                  <p className="text-xs text-gray-400">Final Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-firefly-400">{syncAccuracy}%</p>
                  <p className="text-xs text-gray-400">Sync Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Completion Actions */}
      <footer className="p-5 relative z-10">
        <div className="flex space-x-4">
          <Button
            onClick={handleNewSpark}
            variant="outline"
            className="flex-1 glass-card hover:bg-opacity-60 text-firefly-50 font-semibold py-3 px-4 rounded-xl transition-all border-firefly-400/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Spark
          </Button>
          <Button
            onClick={handleComplete}
            className="flex-1 bg-firefly-400 hover:bg-firefly-500 text-dark-900 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete
          </Button>
        </div>
      </footer>
    </div>
  );
}
