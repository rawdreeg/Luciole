interface Position {
  latitude: number;
  longitude: number;
}

interface ProximityDisplayProps {
  userPosition: Position | null;
  otherUsers: Array<{ userId: string; latitude: number; longitude: number }>;
}

export function ProximityDisplay({ userPosition, otherUsers }: ProximityDisplayProps) {
  return (
    <div className="relative">
      {/* Distance rings */}
      <div className="w-80 h-80 mx-auto relative">
        <div className="absolute inset-0 border-2 border-gray-700 rounded-full opacity-20"></div>
        <div className="absolute inset-8 border-2 border-gray-600 rounded-full opacity-30"></div>
        <div className="absolute inset-16 border-2 border-firefly-400 rounded-full opacity-40"></div>
        <div className="absolute inset-24 border-2 border-firefly-400 rounded-full opacity-60"></div>

        {/* You indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-firefly-400 rounded-full animate-pulse-glow"></div>
        </div>

        {/* Other users indicators */}
        {otherUsers.map((user, index) => (
          <div
            key={user.userId}
            className="absolute top-20 right-20"
            style={{
              transform: `rotate(${index * 45}deg) translateX(60px) rotate(-${index * 45}deg)`,
            }}
          >
            <div className="w-4 h-4 bg-firefly-500 rounded-full animate-firefly-dance"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
