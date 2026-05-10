"use client";

import { Iteration, Supplier, Consumer } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface IterationTableProps {
  iteration: Iteration;
  suppliers: Supplier[];
  consumers: Consumer[];
}

export function IterationTable({ iteration, suppliers, consumers }: IterationTableProps) {
  const rows = iteration.matrix.length;
  const cols = iteration.matrix[0].length;

  // Format potentials if they are derived from M
  const formatPotential = (val: number | null) => {
    if (val === null) return '?';
    if (val <= -500000) return "-M";
    if (val >= 500000) return "M";
    return val;
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted w-[150px]"></TableHead>
            {Array.from({ length: cols }).map((_, j) => (
              <TableHead key={j}>
                <div className="flex flex-col items-center">
                  <span className="text-xs">
                    {j < consumers.length ? consumers[j].name : `Odb. fikcyjny`}
                  </span>
                  <div className="text-[10px] text-blue-600 font-medium italic">β = {formatPotential(iteration.beta[j])}</div>
                </div>
              </TableHead>
            ))}
            <TableHead className="bg-muted/50 w-[80px] text-center text-[10px] uppercase tracking-wider font-bold">Podaż</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {iteration.matrix.map((row, i) => (
            <TableRow key={i}>
              <TableHead className="bg-muted">
                <div className="flex flex-col">
                  <span className="text-xs">
                    {i < suppliers.length ? suppliers[i].name : `Dost. fikcyjny`}
                  </span>
                  <div className="text-[10px] text-blue-600 font-medium italic">α = {formatPotential(iteration.alfa[i])}</div>
                </div>
              </TableHead>
              {row.map((cell, j) => {
                const isEntering = iteration.enteringCell?.[0] === i && iteration.enteringCell?.[1] === j;
                const isLeaving = iteration.leavingCell?.[0] === i && iteration.leavingCell?.[1] === j;
                const inCycle = iteration.cycle?.some(p => p[0] === i && p[1] === j);
                const cycleIdx = iteration.cycle?.findIndex(p => p[0] === i && p[1] === j);
                const cycleSign = cycleIdx !== undefined && cycleIdx !== -1 ? (cycleIdx % 2 === 0 ? "+" : "-") : null;
                const displayProfit = cell.unitProfit <= -500000 ? "-M" : cell.unitProfit;
                
                // Format delta: if it contains M, it's often confusing. We can check if it's very large.
                let displayDelta: string | number = cell.delta ?? '?';
                if (typeof displayDelta === 'number') {
                  if (displayDelta <= -500000) displayDelta = "-M";
                  else if (displayDelta >= 500000) displayDelta = "M";
                }

                return (
                  <TableCell 
                    key={j} 
                    className={`relative p-2 h-24 min-w-[120px] border ${isEntering ? "bg-green-50" : isLeaving ? "bg-red-50" : inCycle ? "bg-blue-50" : ""}`}
                  >
                    <div className="absolute top-1 right-1 text-[10px] text-muted-foreground border p-0.5 rounded leading-none">
                      {displayProfit}
                    </div>
                    
                    {cell.isBasis ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xl font-bold">{cell.amount}</span>
                        {cycleSign && <span className={`text-sm font-bold ${cycleSign === '+' ? 'text-green-600' : 'text-red-600'}`}>({cycleSign})</span>}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs text-muted-foreground">Δ = {displayDelta}</span>
                        {isEntering && <Badge variant="outline" className="text-[8px] bg-green-100 text-green-700 mt-1">Wchodzi (+)</Badge>}
                      </div>
                    )}
                  </TableCell>
                );
              })}
              <TableCell className="bg-muted/20 text-center font-bold text-sm">
                {row.reduce((sum, c) => sum + c.amount, 0)}
              </TableCell>
            </TableRow>
          ))}
          {/* Popyt Row */}
          <TableRow className="bg-muted/10">
            <TableHead className="bg-muted font-bold text-[10px] uppercase tracking-wider text-center">Popyt</TableHead>
            {Array.from({ length: cols }).map((_, j) => (
              <TableCell key={j} className="text-center font-bold text-sm h-12">
                {iteration.matrix.reduce((sum, row) => sum + row[j].amount, 0)}
              </TableCell>
            ))}
            <TableCell className="bg-muted/30"></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
