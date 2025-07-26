export function FireflyAnimation() {
  return (
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
  );
}
