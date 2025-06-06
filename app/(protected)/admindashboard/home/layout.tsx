interface adminhomelayoutprops {
  children: React.ReactNode;

  warishapp: React.ReactNode;
}

export default function Adminhomelayoutprops({
  warishapp,
  children,
}: adminhomelayoutprops) {
  return (
    <div className="flex flex-col p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-800 pb-3 border-b-2 border-blue-200">
          Dashboard Overview
          <span className="block mt-1 text-sm font-normal text-blue-600">
            Comprehensive project insights and metrics
          </span>
        </h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <div className="bg-blue-600/10 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-600">
          {warishapp}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-7 hover:shadow-2xl transition-shadow duration-300">
        {children}
      </div>
    </div>
  );
}
