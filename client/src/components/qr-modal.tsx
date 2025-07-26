import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode } from "lucide-react";

interface QRModalProps {
  url: string;
  onClose: () => void;
}

export function QRModal({ url, onClose }: QRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR code using a public API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    setQrCodeUrl(qrApiUrl);
  }, [url]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-5 z-50">
      <Card className="glass-card rounded-3xl p-8 max-w-sm w-full text-center border-firefly-400/20">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-firefly-50 mb-6">Scan to Connect</h3>

          {/* QR Code */}
          <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-800 mb-2 mx-auto" />
                <p className="text-xs text-gray-600">Loading QR Code...</p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-300 mb-6">
            Ask them to scan this code with their camera
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-firefly-400 hover:bg-firefly-500 text-dark-900 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
