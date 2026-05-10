"use client";

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  Position,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Iteration, Supplier, Consumer } from '@/types';

interface CustomNodeData extends Record<string, unknown> {
  label: string;
  subLabel: string;
  potential: number | string | null;
  isDummy: boolean;
  isSupplier: boolean;
}

interface IterationGraphProps {
  iteration: Iteration;
  suppliers: Supplier[];
  consumers: Consumer[];
}

const CustomNode = ({ data }: NodeProps<Node<CustomNodeData>>) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${data.isDummy ? 'border-dashed border-gray-400' : 'border-primary'}`}>
    <Handle type="target" position={Position.Left} className="w-2 h-2" />
    <div className="flex flex-col">
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs text-muted-foreground">{data.subLabel}</div>
      {data.potential !== undefined && data.potential !== null && (
        <div className="text-xs mt-1 text-blue-600">
          {data.isSupplier ? 'α' : 'β'} = {data.potential}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Right} className="w-2 h-2" />
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

export function IterationGraph({ iteration, suppliers, consumers }: IterationGraphProps) {
  const formatPotential = (val: number | null) => {
    if (val === null) return null;
    if (val <= -500000) return "-M";
    if (val >= 500000) return "M";
    return val;
  };

  const initialElements = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const rows = iteration.matrix.length;
    const cols = iteration.matrix[0].length;

    // Create supplier nodes
    for (let i = 0; i < rows; i++) {
      const isDummy = i >= suppliers.length;
      const label = isDummy ? "Fikcyjny dostawca" : suppliers[i].name;
      nodes.push({
        id: `s-${i}`,
        type: 'custom',
        data: { 
          label, 
          subLabel: `Podaż: ${isDummy ? iteration.matrix[i].reduce((s,c)=>s+c.amount,0) : suppliers[i].supply}`,
          potential: formatPotential(iteration.alfa[i]),
          isDummy,
          isSupplier: true
        },
        position: { x: 0, y: i * 140 },
      });
    }

    // Create consumer nodes
    for (let j = 0; j < cols; j++) {
      const isDummy = j >= consumers.length;
      const label = isDummy ? "Fikcyjny odbiorca" : consumers[j].name;
      nodes.push({
        id: `c-${j}`,
        type: 'custom',
        data: { 
          label, 
          subLabel: `Popyt: ${isDummy ? iteration.matrix.reduce((s,row)=>s+row[j].amount,0) : consumers[j].demand}`,
          potential: formatPotential(iteration.beta[j]),
          isDummy,
          isSupplier: false
        },
        position: { x: 800, y: j * 140 },
      });
    }

    // Create edges for flows
    iteration.matrix.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.amount > 0 || cell.isBasis) {
          const isEntering = iteration.enteringCell?.[0] === i && iteration.enteringCell?.[1] === j;
          const isLeaving = iteration.leavingCell?.[0] === i && iteration.leavingCell?.[1] === j;
          
          const displayProfit = cell.unitProfit <= -500000 ? "-M" : cell.unitProfit;

          // Deterministic unique positions for labels along the edge
          const labelPosition = 0.25 + ((i * 2 + j * 3) % 6) * 0.12;

          edges.push({
            id: `e-${i}-${j}`,
            source: `s-${i}`,
            target: `c-${j}`,
            label: `${cell.amount} (zysk: ${displayProfit})`,
            animated: cell.amount > 0,
            type: 'default',
            labelShowBg: true,
            labelStyle: { fill: '#000', fontWeight: 800, fontSize: 11 },
            labelBgStyle: { fill: '#fff', fillOpacity: 1 },
            labelBgPadding: [6, 4],
            labelBgBorderRadius: 4,
            // @ts-ignore
            labelPosition: labelPosition,
            style: { 
              stroke: isEntering ? '#22c55e' : isLeaving ? '#ef4444' : '#94a3b8',
              strokeWidth: cell.amount > 0 ? 3 : 1.5,
              opacity: cell.isBasis ? 1 : 0.4
            },
          });
        }
      });
    });

    return { nodes, edges };
  }, [iteration, suppliers, consumers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);
  }, [initialElements, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full border rounded-lg bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
