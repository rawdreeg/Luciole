/**
 * @interface Position
 * @description Represents a geographical position with latitude and longitude.
 * @property {number} latitude - The latitude of the position.
 * @property {number} longitude - The longitude of the position.
 */
interface Position {
  latitude: number;
  longitude: number;
}

/**
 * @interface ProximityDisplayProps
 * @description Defines the props for the ProximityDisplay component.
 * @property {Position | null} userPosition - The current user's position.
 * @property {Array<{ userId: string; latitude: number; longitude: number }>} otherUsers - An array of other users with their positions.
 */
interface ProximityDisplayProps {
  userPosition: Position | null;
  otherUsers: Array<{ userId: string; latitude: number; longitude: number }>;
}

/**
 * A component that displays a proximity radar-like interface.
 * It shows the current user at the center and other users as dots around them.
 * The distance rings give a visual indication of proximity.
 * @param {ProximityDisplayProps} props - The props for the component.
 * @returns {JSX.Element} The rendered proximity display component.
 */
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
