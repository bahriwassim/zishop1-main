import TestRealScenarios from "@/components/test-real-scenarios";

export default function TestRealScenariosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Tests des Scénarios Réels
          </h1>
          <p className="text-gray-600">
            Testez toutes les fonctionnalités de l'application avec des données réelles
          </p>
        </div>
        
        <TestRealScenarios />
      </div>
    </div>
  );
} 