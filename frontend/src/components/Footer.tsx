export function Footer() {
  const developers = [
    "Pedro Rojas",
    "Adolfo Toledo",
    "Martín García",
    "Ignacia Miranda",
    "Esteban Zepeda",
    "Patricio Vejar",
    "Basthian Valenzuela",
    "Bryan Rojas",
    "Felipe Canales",
    "Rafael Bugueño"
  ];

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Desarrollado por:</span>
          <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="flex items-center gap-4 min-w-max">
              {developers.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">{name}</span>
                  {index < developers.length - 1 && (
                    <span className="text-gray-400">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Sistema de Gestión Kinesiológica © 2025
        </p>
      </div>
    </footer>
  );
}
