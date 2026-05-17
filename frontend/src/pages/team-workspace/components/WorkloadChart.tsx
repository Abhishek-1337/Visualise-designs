import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface WorkloadData {
  name: string;
  workload: number;
  capacity: number;
}

interface WorkloadChartProps {
  data: WorkloadData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const WorkloadChart = ({ data }: WorkloadChartProps) => {
  const getBarColor = (value: number) => {
    if (value >= 90) return 'var(--color-error)';
    if (value >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-warm-lg p-3">
          <p className="text-sm font-medium text-popover-foreground mb-1">{payload?.[0]?.payload?.name}</p>
          <p className="text-xs text-muted-foreground">
            Workload: <span className="font-semibold text-foreground">{payload?.[0]?.value}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Capacity: <span className="font-semibold text-foreground">{payload?.[0]?.payload?.capacity}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
          Team Workload Distribution
        </h2>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-success rounded-sm" />
            <span className="text-xs text-muted-foreground">Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-warning rounded-sm" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-error rounded-sm" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Team Workload Distribution Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              label={{ value: 'Workload %', angle: -90, position: 'insideLeft', fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => <span style={{ color: 'var(--color-foreground)', fontSize: '12px' }}>{value}</span>}
            />
            <Bar dataKey="workload" name="Current Workload" radius={[8, 8, 0, 0]}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry?.workload)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkloadChart;
