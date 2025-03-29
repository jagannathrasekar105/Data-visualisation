import dataVisualisation from "../../src/asset/global-network-connection-concept-big-600nw-2413529947.webp";

function Header() {
  return (
    <div className="fixed bottom-0 left-0 w-full flex flex-wrap items-center justify-center gap-4 p-2 bg-gradient-to-r from-yellow-500 to-green-500 shadow-lg outline outline-black/5">
      {/* Left Logo */}
      <img
        className="h-12 sm:h-16 w-auto max-w-xs sm:max-w-sm md:max-w-md rounded"
        src={dataVisualisation}
        alt="dataVisual-logo"
      />

      {/* Text Section */}
      <p className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 flex flex-wrap items-center justify-center text-center">
        <span className="mr-2 flex items-center">
          <h2 className="font-bold text-2xl sm:text-4xl md:text-5xl">W</h2>
          elcome
        </span>
        <span className="mx-1">to Data</span>
        <span className="ml-2">Visualisation</span>
      </p>

      {/* Right Logo */}
      <img
        className="h-12 sm:h-16 w-auto max-w-xs sm:max-w-sm md:max-w-md rounded"
        src={dataVisualisation}
        alt="dataVisual-logo"
      />
    </div>
  );
}

export default Header;
