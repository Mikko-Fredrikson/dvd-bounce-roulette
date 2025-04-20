import GameArea from "./components/GameArea/GameArea";
import ControlPanel from "./components/ControlPanel/ControlPanel";

function App() {
  return (
    <div className="app-container min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        DVD Bounce Roulette
      </h1>
      <div className="game-container flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
        {/* Game Area (2/3 of screen on larger devices) */}
        <div className="w-full md:w-2/3 h-[60vh] md:h-[80vh]">
          <GameArea />
        </div>

        {/* Control Panel (1/3 of screen on larger devices) */}
        <div className="w-full md:w-1/3 h-[60vh] md:h-[80vh]">
          <ControlPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
