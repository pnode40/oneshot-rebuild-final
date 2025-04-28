import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/apiRequest.js';
import { Metrics } from '../../shared/types/metricsTypes.js';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics>({});

  useEffect(() => {
    async function fetchMetrics() {
      const response = await apiRequest<Metrics>('/api/metrics', 'GET');
      if (response.success && response.data) {
        setMetrics(response.data);
      }
    }
    fetchMetrics();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await apiRequest('/api/metrics', 'PATCH', metrics);
    alert('Metrics saved!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Athletic Metrics</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Height (Feet)</label>
          <input type="number" name="heightFeet" value={metrics.heightFeet || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Height (Inches)</label>
          <input type="number" name="heightInches" value={metrics.heightInches || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Weight (lbs)</label>
          <input type="number" name="weight" value={metrics.weight || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>40-Yard Dash (sec)</label>
          <input type="number" step="0.01" name="fortyYardDash" value={metrics.fortyYardDash || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Shuttle Run (sec)</label>
          <input type="number" step="0.01" name="shuttleRun" value={metrics.shuttleRun || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Vertical Jump (inches)</label>
          <input type="number" name="verticalJump" value={metrics.verticalJump || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        {/* Position-Specific Metrics */}
        <div>
          <label>Passing Yards</label>
          <input type="number" name="passingYards" value={metrics.passingYards || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Rushing Yards</label>
          <input type="number" name="rushingYards" value={metrics.rushingYards || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Receiving Yards</label>
          <input type="number" name="receivingYards" value={metrics.receivingYards || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Tackles</label>
          <input type="number" name="tackles" value={metrics.tackles || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Sacks</label>
          <input type="number" name="sacks" value={metrics.sacks || ''} onChange={handleChange} className="border p-2 w-full" />
        </div>
      </div>

      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded mt-6">Save Metrics</button>
    </div>
  );
} 