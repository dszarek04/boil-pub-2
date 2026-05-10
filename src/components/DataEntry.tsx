"use client";

import { useStore } from "@/store/useStore";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Lock, Unlock, Plus, Trash2, LayoutGrid, FileText } from "lucide-react";
import { examples } from "@/lib/examples";

export function DataEntry() {
  const {
    suppliers,
    consumers,
    transportCosts,
    blockedSuppliers,
    setSuppliers,
    setConsumers,
    setTransportCosts,
    toggleSupplierBlock,
    loadExample
  } = useStore();

  const addSupplier = () => {
    if (suppliers.length >= 10) return;
    const newSuppliers = [...suppliers, {
      id: `s${Date.now()}`,
      name: `Dostawca ${suppliers.length + 1}`,
      supply: 0,
      purchasePrice: 0
    }];
    setSuppliers(newSuppliers);
    const newCosts = transportCosts.map(row => [...row]);
    newCosts.push(new Array(consumers.length).fill(0));
    setTransportCosts(newCosts);
  };

  const removeSupplier = (idx: number) => {
    if (suppliers.length <= 1) return;
    setSuppliers(suppliers.filter((_, i) => i !== idx));
    setTransportCosts(transportCosts.filter((_, i) => i !== idx));
  };

  const addConsumer = () => {
    if (consumers.length >= 10) return;
    const newConsumers = [...consumers, {
      id: `c${Date.now()}`,
      name: `Odbiorca ${consumers.length + 1}`,
      demand: 0,
      sellPrice: 0
    }];
    setConsumers(newConsumers);
    setTransportCosts(transportCosts.map(row => [...row, 0]));
  };

  const removeConsumer = (idx: number) => {
    if (consumers.length <= 1) return;
    setConsumers(consumers.filter((_, i) => i !== idx));
    setTransportCosts(transportCosts.map(row => row.filter((_, i) => i !== idx)));
  };

  const updateSupplier = (idx: number, field: string, val: string) => {
    const num = parseFloat(val) || 0;
    const newSuppliers = [...suppliers];
    newSuppliers[idx] = { ...newSuppliers[idx], [field]: num };
    setSuppliers(newSuppliers);
  };

  const updateConsumer = (idx: number, field: string, val: string) => {
    const num = parseFloat(val) || 0;
    const newConsumers = [...consumers];
    newConsumers[idx] = { ...newConsumers[idx], [field]: num };
    setConsumers(newConsumers);
  };

  const updateCost = (sIdx: number, cIdx: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newCosts = transportCosts.map(row => [...row]);
    newCosts[sIdx][cIdx] = num;
    setTransportCosts(newCosts);
  };

  return (
    <div className="space-y-6">
      {/* Examples Bar */}
      <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border mx-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground px-1">
          <FileText className="w-4 h-4" /> Wczytaj przykład:
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {examples.map((ex, i) => (
            <Button 
              key={i} 
              variant="secondary" 
              size="sm" 
              onClick={() => loadExample(ex)}
              className="bg-white hover:bg-primary hover:text-primary-foreground border shadow-sm transition-all text-xs"
            >
              {ex.name}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4 px-3">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Konfiguracja problemu
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addSupplier} disabled={suppliers.length >= 10} className="rounded-lg h-9">
                <Plus className="w-4 h-4 mr-1" /> Dostawca
              </Button>
              <Button size="sm" variant="outline" onClick={addConsumer} disabled={consumers.length >= 10} className="rounded-lg h-9">
                <Plus className="w-4 h-4 mr-1" /> Odbiorca
              </Button>
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-xl border border-border bg-white shadow-sm mx-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted/20">
                  <TableHead className="w-[240px] border-r font-bold text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                    Dostawcy \ Odbiorcy
                  </TableHead>
                  {consumers.map((c, ci) => (
                    <TableHead key={c.id} className="min-w-[140px] p-0 border-r text-center">
                      <div className="flex items-center py-2 px-3 gap-2">
                        <Input 
                          className="h-8 border-none text-left font-bold text-sm bg-transparent focus-visible:ring-1 focus:bg-white flex-1"
                          value={c.name} 
                          onChange={(e) => {
                            const newC = [...consumers];
                            newC[ci].name = e.target.value;
                            setConsumers(newC);
                          }} 
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-7 h-7 text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => removeConsumer(ci)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] border-r text-center font-bold text-[9px] uppercase text-primary/60">
                    Cena zakupu
                  </TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-[9px] uppercase text-primary/60">
                    Podaż
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s, si) => (
                  <TableRow key={s.id} className="hover:bg-muted/5">
                    <TableHead className="p-0 border-r bg-muted/10">
                      <div className="flex items-center h-full px-3 gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`shrink-0 w-8 h-8 rounded-md transition-all ${blockedSuppliers[si] ? "text-destructive bg-destructive/5" : "text-muted-foreground"}`}
                          onClick={() => toggleSupplierBlock(si)}
                        >
                          {blockedSuppliers[si] ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Input 
                          className="h-10 border-none font-bold text-sm bg-transparent focus-visible:ring-1 focus:bg-white flex-1 text-left"
                          value={s.name} 
                          onChange={(e) => {
                            const newS = [...suppliers];
                            newS[si].name = e.target.value;
                            setSuppliers(newS);
                          }} 
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 w-8 h-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeSupplier(si)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableHead>
                    {consumers.map((c, ci) => (
                      <TableCell key={c.id} className="p-0 border-r">
                        <Input 
                          type="number" 
                          className="h-12 border-none text-center text-sm shadow-none focus-visible:ring-1 focus:bg-primary/5"
                          value={transportCosts[si]?.[ci] || 0}
                          onChange={(e) => updateCost(si, ci, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="p-0 border-r">
                      <Input 
                        type="number" 
                        className="h-12 border-none text-center focus-visible:ring-1 bg-primary/[0.01]"
                        value={s.purchasePrice} 
                        onChange={(e) => updateSupplier(si, 'purchasePrice', e.target.value)} 
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <Input 
                        type="number" 
                        className="h-12 border-none text-center font-bold text-primary focus-visible:ring-1 bg-primary/[0.01]"
                        value={s.supply} 
                        onChange={(e) => updateSupplier(si, 'supply', e.target.value)} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Cena Sprzedaży Row */}
                <TableRow className="hover:bg-transparent border-t-2">
                  <TableHead className="bg-muted/5 border-r font-bold text-[9px] uppercase text-primary/60 text-center h-12">
                    Cena sprzedaży
                  </TableHead>
                  {consumers.map((c, ci) => (
                    <TableCell key={c.id} className="p-0 border-r">
                      <Input 
                        type="number" 
                        className="h-12 border-none text-center focus-visible:ring-1 bg-primary/[0.01]"
                        value={c.sellPrice} 
                        onChange={(e) => updateConsumer(ci, 'sellPrice', e.target.value)} 
                      />
                    </TableCell>
                  ))}
                  <TableCell colSpan={2} className="bg-muted/5"></TableCell>
                </TableRow>

                {/* Popyt Row */}
                <TableRow className="hover:bg-transparent border-t">
                  <TableHead className="bg-muted/5 border-r font-bold text-[9px] uppercase text-primary/60 text-center h-12">
                    Popyt
                  </TableHead>
                  {consumers.map((c, ci) => (
                    <TableCell key={c.id} className="p-0 border-r">
                      <Input 
                        type="number" 
                        className="h-12 border-none text-center font-bold text-primary focus-visible:ring-1 bg-primary/[0.01]"
                        value={c.demand} 
                        onChange={(e) => updateConsumer(ci, 'demand', e.target.value)} 
                      />
                    </TableCell>
                  ))}
                  <TableCell colSpan={2} className="bg-muted/5"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground italic leading-relaxed px-3">
            <Lock className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
            <span>Zablokowanie dostawcy (kłódka) wymusza, aby jego podaż została rozpatrzona jako pierwsza przez algorytm kąta północno-zachodniego, zapewniając priorytetowe zaspokojenie potrzeb odbiorców.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
