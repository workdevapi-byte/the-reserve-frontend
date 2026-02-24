import { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import styles from './DashboardChart.module.css';

const DashboardChart = ({ expenses }) => {
    const [timeFilter, setTimeFilter] = useState('Month');

    // Aggregate data: Category on X-axis, Amount on Y-axis
    const chartData = useMemo(() => {
        const now = new Date();
        let filtered = expenses;

        // Filter by time first
        filtered = filtered.filter(e => {
            const d = new Date(e.date);
            if (timeFilter === 'Day') {
                return d.toDateString() === now.toDateString();
            } else if (timeFilter === 'Week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return d >= oneWeekAgo;
            } else if (timeFilter === 'Month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            } else if (timeFilter === 'Year') {
                return d.getFullYear() === now.getFullYear();
            }
            return true;
        });

        // Group by Category
        const categoryMap = {};
        filtered.forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });

        // Convert to array and sort by amount
        return Object.keys(categoryMap)
            .map(cat => ({ name: cat, value: categoryMap[cat] }))
            .sort((a, b) => b.value - a.value);
    }, [expenses, timeFilter]);

    const COLORS = ['#58a6ff', '#3fb950', '#f85149', '#d299ff', '#e3b341', '#f0883e'];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div>
                        <h3>Category Breakdown</h3>
                        <p>Spending totals by category</p>
                    </div>
                </div>
                <div className={styles.filters}>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="Day">Day</option>
                        <option value="Week">Week</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                    </select>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--accent-dim)' }}
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--text)',
                                fontSize: '13px',
                                boxShadow: 'var(--shadow)'
                            }}
                            itemStyle={{ color: 'var(--text)' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Spent']}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardChart;
