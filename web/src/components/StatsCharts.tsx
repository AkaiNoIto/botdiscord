'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function StatsCharts() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    if (!stats || !stats.history || stats.history.length === 0) {
        return <div className="p-4 bg-gray-800 rounded-lg text-gray-400">Not enough data yet to show charts. Check back tomorrow!</div>;
    }

    const labels = stats.history.map((h: any) => h.date);
    
    const memberData = {
        labels,
        datasets: [{
            label: 'Members',
            data: stats.history.map((h: any) => h.members),
            borderColor: '#3498DB',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.4,
        }]
    };

    const wealthData = {
        labels,
        datasets: [{
            label: 'Total Coins',
            data: stats.history.map((h: any) => h.wealth),
            borderColor: '#F1C40F',
            backgroundColor: 'rgba(241, 196, 15, 0.2)',
            tension: 0.4,
        }]
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Server Growth</h3>
                <Line data={memberData} />
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Economy Wealth</h3>
                <Line data={wealthData} />
            </div>
        </div>
    );
}
