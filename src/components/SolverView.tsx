"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { solveIntermediaryProblem } from "@/lib/solver";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DataEntry } from "./DataEntry";
import { IterationGraph } from "./IterationGraph";
import { IterationTable } from "./IterationTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChevronLeft, ChevronRight, Calculator, RefreshCcw } from "lucide-react";

export function SolverView() {
  const [activeTab, setActiveTab] = useState("input");
  const { 
    suppliers, 
    consumers, 
    transportCosts, 
    blockedSuppliers,
    iterations,
    currentIterationIndex,
    setIterations,
    setCurrentIterationIndex,
    reset
  } = useStore();

  const handleSolve = () => {
    const results = solveIntermediaryProblem(suppliers, consumers, transportCosts, blockedSuppliers);
    setIterations(results);
    setActiveTab("results");
  };

  const currentIteration = iterations[currentIterationIndex];
  const totals = currentIteration
    ? currentIteration.matrix.reduce(
        (acc, row, i) => {
          row.forEach((cell, j) => {
            if (cell.amount <= 0) return;
            const isSupplierDummy = i >= suppliers.length;
            const isConsumerDummy = j >= consumers.length;
            const isBlocked = cell.unitProfit <= -500000;
            if (isSupplierDummy || isConsumerDummy || isBlocked) return;

            acc.transportCost += cell.amount * (transportCosts[i]?.[j] ?? 0);
            acc.purchaseCost += cell.amount * suppliers[i].purchasePrice;
            acc.totalSales += cell.amount * consumers[j].sellPrice;
          });
          return acc;
        },
        { transportCost: 0, purchaseCost: 0, totalSales: 0 }
      )
    : { transportCost: 0, purchaseCost: 0, totalSales: 0 };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="input">Dane wejściowe</TabsTrigger>
        <TabsTrigger value="results" disabled={iterations.length === 0}>Wyniki i iteracje</TabsTrigger>
      </TabsList>
      
      <TabsContent value="input" className="space-y-4">
        <DataEntry />
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" size="lg" onClick={reset}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Resetuj
          </Button>
          <Button size="lg" onClick={handleSolve}>
            <Calculator className="w-4 h-4 mr-2" /> Rozwiąż zagadnienie
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="results">
        {currentIteration && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentIteration.title}</h2>
                <p className="text-muted-foreground">
                  Zysk całkowity: <span className="font-bold text-primary">{currentIteration.totalProfit}</span>
                </p>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  <p>
                    Koszt transportu:{" "}
                    <span className="font-semibold text-foreground">{totals.transportCost.toLocaleString()}</span>
                  </p>
                  <p>
                    Koszt zakupu:{" "}
                    <span className="font-semibold text-foreground">{totals.purchaseCost.toLocaleString()}</span>
                  </p>
                  <p>
                    Całkowita cena sprzedaży:{" "}
                    <span className="font-semibold text-foreground">{totals.totalSales.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={currentIterationIndex === 0}
                  onClick={() => setCurrentIterationIndex(currentIterationIndex - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentIterationIndex + 1} / {iterations.length}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={currentIterationIndex === iterations.length - 1}
                  onClick={() => setCurrentIterationIndex(currentIterationIndex + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Macierz transportowa</CardTitle>
                    <CardDescription>Szczegóły przydziałów, kosztów marginalnych i potencjałów.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IterationTable 
                      iteration={currentIteration} 
                      suppliers={suppliers} 
                      consumers={consumers} 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Wizualizacja grafu</CardTitle>
                    <CardDescription>Przepływy towarów pomiędzy dostawcami a odbiorcami.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IterationGraph 
                      iteration={currentIteration} 
                      suppliers={suppliers} 
                      consumers={consumers} 
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentIteration.isOptimal ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        <p className="font-bold">Znaleziono rozwiązanie optymalne!</p>
                        <p className="text-sm">Nie można już zwiększyć zysku.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                        <p className="font-bold">To nie jest rozwiązanie optymalne.</p>
                        <p className="text-sm">
                          Komórka do wejścia: ({(currentIteration.enteringCell?.[0] ?? 0) + 1}, {(currentIteration.enteringCell?.[1] ?? 0) + 1})
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm space-y-2">
                      <p><strong>Dostawcy:</strong> {suppliers.length}</p>
                      <p><strong>Odbiorcy:</strong> {consumers.length}</p>
                      <hr />
                      <p className="text-xs text-muted-foreground">
                        Wizualizacja wykorzystuje kolory:
                        <br/>- <span className="text-green-600 font-bold">Zielony</span>: Nowy przydział
                        <br/>- <span className="text-red-600 font-bold">Czerwony</span>: Usuwany przydział
                        <br/>- <span className="text-blue-600 font-bold">Niebieski</span>: Cykl poprawy
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
