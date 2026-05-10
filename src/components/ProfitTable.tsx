"use client";

import { Iteration, Supplier, Consumer } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface ProfitTableProps {
  iteration: Iteration;
  suppliers: Supplier[];
  consumers: Consumer[];
}

export function ProfitTable({ iteration, suppliers, consumers }: ProfitTableProps) {
  const rows = iteration.matrix.length;
  const cols = iteration.matrix[0].length;

  const entries: {
    from: string;
    to: string;
    amount: number;
    unitProfit: number | string;
    total: number;
    isDummy: boolean;
  }[] = [];

  iteration.matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.amount > 0) {
        const isSupplierDummy = i >= suppliers.length;
        const isConsumerDummy = j >= consumers.length;
        const from = isSupplierDummy ? "Dostawca fikcyjny" : suppliers[i].name;
        const to = isConsumerDummy ? "Odbiorca fikcyjny" : consumers[j].name;
        const isBlocked = cell.unitProfit <= -500000;
        
        entries.push({
          from,
          to,
          amount: cell.amount,
          unitProfit: isBlocked ? "-M" : cell.unitProfit,
          total: isBlocked || isSupplierDummy || isConsumerDummy ? 0 : cell.amount * cell.unitProfit,
          isDummy: isSupplierDummy || isConsumerDummy || isBlocked
        });
      }
    });
  });

  const grandTotal = entries.reduce((sum, e) => sum + e.total, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skąd (Dostawca)</TableHead>
              <TableHead>Dokąd (Odbiorca)</TableHead>
              <TableHead className="text-right">Ilość</TableHead>
              <TableHead className="text-right">Zysk jedn.</TableHead>
              <TableHead className="text-right">Zysk całkowity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length > 0 ? (
              entries.map((entry, idx) => (
                <TableRow key={idx} className={entry.isDummy ? "opacity-50 italic bg-muted/30" : ""}>
                  <TableCell className="font-medium">{entry.from}</TableCell>
                  <TableCell className="font-medium">{entry.to}</TableCell>
                  <TableCell className="text-right font-mono">{entry.amount}</TableCell>
                  <TableCell className="text-right font-mono">{entry.unitProfit}</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {entry.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Brak przydziałów w tej iteracji.
                </TableCell>
              </TableRow>
            )}
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableCell colSpan={4} className="text-right font-bold py-4">
                Suma zysków (bez tras fikcyjnych i blokad):
              </TableCell>
              <TableCell className="text-right font-mono text-lg font-black text-primary">
                {grandTotal.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="text-[10px] text-muted-foreground italic px-2">
        * Wiersze półprzezroczyste oznaczają przydziały do węzłów fikcyjnych lub tras zablokowanych (zysk = 0).
      </p>
    </div>
  );
}
