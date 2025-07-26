import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, MessageSquare, QrCode, Flame } from "lucide-react";
import { QRModal } from "@/components/qr-modal";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Spark, SparkConnection } from "@shared/schema";

interface SparkCreatedProps {
  sparkId: string;
}

export default function SparkCreated({ sparkId }: SparkCreatedProps) {
  const [, setLocation] = useLocation();
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();

  const { data: spark } = useQuery<Spark>({
    queryKey: [`/api/sparks/${sparkId}`],
  });

  const { data: connections = [] } = useQuery<SparkConnection[]>({
    queryKey: [`/api/sparks/${sparkId}/connections`],
    refetchInterval: 2000,
  });

  const shareableLink = `${window.location.origin}/s/${sparkId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShareViaSMS = () => {
    const message = `Join me on Luciole! ${shareableLink}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  if (!spark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-firefly-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading spark...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-5 pt-12">
        <Button
          onClick={handleGoHome}
          variant="ghost"
          className="text-firefly-400 hover:text-firefly-50 transition-colors p-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 -mt-16">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-firefly-400 rounded-full animate-pulse-glow flex items-center justify-center">
            <Flame className="w-8 h-8 text-dark-900" />
          </div>
          <h2 className="text-2xl font-bold text-firefly-50 mb-2">Spark Created!</h2>
          <p className="text-gray-300">Share this link with someone to connect</p>
        </div>

        {/* Shareable Link */}
        <div className="w-full max-w-sm mb-8">
          <Card className="glass-card rounded-2xl border-firefly-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Spark ID</span>
                <span className="text-firefly-400 font-mono">{sparkId}</span>
              </div>
              <div className="bg-dark-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-firefly-50 font-mono break-all">
                  {shareableLink}
                </p>
              </div>
              <Button
                onClick={handleCopyLink}
                className="w-full bg-firefly-400 hover:bg-firefly-500 text-dark-900 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </CardContent>
          </Card>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={handleShareViaSMS}
              variant="outline"
              className="glass-card hover:bg-opacity-60 py-6 px-4 rounded-xl transition-all border-firefly-400/20 flex-col h-auto"
            >
              <MessageSquare className="w-6 h-6 text-firefly-400 mb-1" />
              <p className="text-xs text-gray-300">Text</p>
            </Button>
            <Button
              onClick={() => setShowQRModal(true)}
              variant="outline"
              className="glass-card hover:bg-opacity-60 py-6 px-4 rounded-xl transition-all border-firefly-400/20 flex-col h-auto"
            >
              <QrCode className="w-6 h-6 text-firefly-400 mb-1" />
              <p className="text-xs text-gray-300">QR Code</p>
            </Button>
          </div>
        </div>

        {/* Waiting Status */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-firefly-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Waiting for connection...</span>
          </div>
          <p className="text-xs text-gray-500">{connections.length} people connected</p>
        </div>
      </main>

      {/* QR Modal */}
      {showQRModal && (
        <QRModal
          url={shareableLink}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
