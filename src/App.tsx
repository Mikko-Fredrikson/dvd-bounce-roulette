import GameArea from "./components/GameArea/GameArea";
import ControlPanel from "./components/ControlPanel/ControlPanel";
import WinnerDisplay from "./components/WinnerDisplay/WinnerDisplay"; // Import WinnerDisplay

function App() {
  return (
    <div className="app-container min-h-screen bg-slate-100 p-6">
      <div className="mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-800">
          DVD Bounce Roulette
        </h1>
        <div className="game-container flex flex-col md:flex-row gap-6 relative">
          {/* Game Area (2/3 of screen on larger devices) */}
          <div className="w-full md:w-2/3 flex items-center justify-center">
            {/* Winner Display Popup */}
            <WinnerDisplay />
            {/* Game Area */}
            <GameArea />
          </div>

          {/* Control Panel (1/3 of screen on larger devices) */}
          <div className="w-full md:w-1/3 h-[60vh] md:h-[80vh]">
            <ControlPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
