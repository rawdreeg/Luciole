import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * @interface InstallPromptProps
 * @description Defines the props for the InstallPrompt component.
 * @property {() => void} onDismiss - A callback function to be called when the prompt is dismissed.
 */
interface InstallPromptProps {
  onDismiss: () => void;
}

/**
 * A component that prompts the user to install the application as a PWA.
 * It listens for the `beforeinstallprompt` event and displays a custom
 * installation prompt when the event is fired.
 * @param {InstallPromptProps} props - The props for the component.
 * @returns {JSX.Element} The rendered installation prompt component.
 */
export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  // Listen for the beforeinstallprompt event
  useState(() => {
    /**
     * Handles the `beforeinstallprompt` event.
     * It prevents the default prompt from showing and saves the event object
     * to be used later for a custom prompt.
     * @param {any} e - The `beforeinstallprompt` event.
     */
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  });

  /**
   * Handles the click event on the install button.
   * It shows the installation prompt to the user and displays a toast message
   * based on their choice.
   */
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "Success",
          description: "Luciole has been installed!",
        });
      }
      setDeferredPrompt(null);
    } else {
      toast({
        title: "Install",
        description: "Use your browser's install option to add Luciole to your home screen.",
      });
    }
    onDismiss();
  };

  return (
    <div className="fixed bottom-5 left-5 right-5 z-50">
      <Card className="glass-card rounded-2xl border-firefly-400/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-firefly-400 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-dark-900" />
              </div>
              <div>
                <p className="text-sm font-medium text-firefly-50">Install Luciole</p>
                <p className="text-xs text-gray-400">Quick access from your home screen</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Later
              </Button>
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-firefly-400 hover:bg-firefly-500 text-dark-900 text-sm font-medium px-3 py-1 rounded-lg transition-colors"
              >
                Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
