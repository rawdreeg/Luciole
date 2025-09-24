import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, Link2, Palette } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { FireflyAnimation } from "@/components/firefly-animation";
import { InstallPrompt } from "@/components/install-prompt";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Spark } from "@shared/zod";

/**
 * The home page of the application.
 * It allows users to create a new spark with a custom color or join an existing one via a link.
 * @returns {JSX.Element} The rendered home page.
 */
export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FFB800");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorOptions = [
    { name: "Firefly Yellow", color: "#FFB800" },
    { name: "Electric Blue", color: "#0099FF" },
    { name: "Neon Green", color: "#00FF88" },
    { name: "Hot Pink", color: "#FF0080" },
    { name: "Purple", color: "#8800FF" },
    { name: "Orange", color: "#FF4400" },
    { name: "Red", color: "#FF0000" },
    { name: "White", color: "#FFFFFF" },
  ];

  const createSparkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sparks", {
        flashColor: selectedColor,
      });
      return response.json() as Promise<Spark>;
    },
    onSuccess: (spark) => {
      setLocation(`/spark/${spark.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create spark. Please try again.",
        variant: "destructive",
      });
    },
  });

  /**
   * Handles the creation of a new spark.
   */
  const handleCreateSpark = () => {
    createSparkMutation.mutate();
  };

  /**
   * Handles joining a spark via a pasted link.
   */
  const handleJoinViaLink = () => {
    const input = prompt("Paste the Luciole link here:");
    if (input) {
      try {
        const url = new URL(input);
        const pathParts = url.pathname.split("/");
        const sparkId = pathParts[pathParts.length - 1];
        if (sparkId.startsWith("FLY-")) {
          setLocation(`/s/${sparkId}`);
        } else {
          toast({
            title: "Invalid Link",
            description: "Please enter a valid Luciole link.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Invalid Link",
          description: "Please enter a valid Luciole link.",
          variant: "destructive",
        });
      }
    }
  };

  // Show install prompt after 10 seconds
  useState(() => {
    const timer = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 10000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 p-5 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-firefly-400 rounded-full animate-pulse-glow"></div>
            <h1 className="text-2xl font-bold text-firefly-50">Luciole</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 -mt-16">
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <FireflyAnimation flashColor={selectedColor} />
          </div>

          <h2 className="text-3xl font-bold text-firefly-50 mb-4">
            Find Each Other
            <br />
            in the Crowd
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Create a spark and share the link.
            <br />
            When you're close, your lights will sync.
          </p>

          {/* Color Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Choose your flash color:</h3>
            
            {/* Color Preview and Picker Toggle */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <Button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  variant="outline"
                  className="bg-transparent border-gray-400 text-white hover:bg-gray-800"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {showColorPicker ? 'Hide' : 'Pick'} Color
                </Button>
              </div>
              
              <p className="text-sm text-gray-400 text-center">
                Selected: {selectedColor.toUpperCase()}
              </p>
              
              {/* Quick Color Presets */}
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.color}
                    onClick={() => setSelectedColor(option.color)}
                    className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                      selectedColor === option.color
                        ? 'border-white scale-110'
                        : 'border-gray-400 hover:border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  />
                ))}
              </div>
              
              {/* Color Picker */}
              {showColorPicker && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <HexColorPicker 
                    color={selectedColor} 
                    onChange={setSelectedColor}
                    style={{ width: '200px', height: '200px' }}
                  />
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-mono border border-gray-600 w-24"
                      placeholder="#FFB800"
                    />
                    <span className="text-gray-400 text-sm">or pick from wheel</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={handleCreateSpark}
            disabled={createSparkMutation.isPending}
            className="w-full bg-firefly-400 hover:bg-firefly-500 text-dark-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow h-auto"
          >
            <Plus className="w-5 h-5 mr-3" />
            {createSparkMutation.isPending ? "Creating..." : "Create New Spark"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-900 text-gray-400">or</span>
            </div>
          </div>

          <Button
            onClick={handleJoinViaLink}
            variant="outline"
            className="w-full glass-card hover:bg-opacity-60 text-firefly-50 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 border-firefly-400/20 h-auto"
          >
            <Link2 className="w-5 h-5 mr-3" />
            Join via Link
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-5 text-center">
        <p className="text-sm text-gray-500">Tap anywhere to get started</p>
      </footer>

      {/* Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
}
