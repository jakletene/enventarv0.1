import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface StockLevel {
  name: string;
  value: number;
  color: string;
}

interface StockLevelChartProps {
  data: StockLevel[];
}

export default function StockLevelChart({ data }: StockLevelChartProps) {
  const hasData = data.some(item => item.value > 0);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-secondary-800 rounded-lg p-6 h-[400px] flex items-center justify-center"
      >
        <p className="text-secondary-400">No stock data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-secondary-800 rounded-lg p-6 h-[400px]"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Stock Level</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}