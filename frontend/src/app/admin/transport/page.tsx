'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Vehicle {
  id: string;
  registrationNo: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
}

interface Route {
  id: string;
  name: string;
  stops: string;
  monthlyFee: number;
}

export default function TransportManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // New vehicle form state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vReg, setVReg] = useState('');
  const [vCap, setVCap] = useState('');
  const [vDriver, setVDriver] = useState('');
  const [vPhone, setVPhone] = useState('');

  // New route form state
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [rName, setRName] = useState('');
  const [rStops, setRStops] = useState('');
  const [rFee, setRFee] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const vRes = await api.get('/transport/vehicles');
      const rRes = await api.get('/transport/routes');
      if (vRes.data.success) setVehicles(vRes.data.vehicles);
      if (rRes.data.success) setRoutes(rRes.data.routes);
    } catch (error) {
      console.error('Error fetching transport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transport/vehicles', {
        registrationNo: vReg,
        capacity: vCap,
        driverName: vDriver,
        driverPhone: vPhone
      });
      setShowVehicleForm(false);
      setVReg(''); setVCap(''); setVDriver(''); setVPhone('');
      fetchData();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to create vehicle');
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transport/routes', {
        name: rName,
        stops: rStops,
        monthlyFee: rFee
      });
      setShowRouteForm(false);
      setRName(''); setRStops(''); setRFee('');
      fetchData();
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading transport data...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transport Management</h1>
          <p className="text-gray-500 mt-1">Manage vehicles, routes, and student allocations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Fleet (Vehicles)</h2>
            <button 
              onClick={() => setShowVehicleForm(!showVehicleForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Add Vehicle
            </button>
          </div>

          {showVehicleForm && (
            <form onSubmit={handleCreateVehicle} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input required placeholder="Registration No (e.g. WB-01-A-1234)" value={vReg} onChange={e => setVReg(e.target.value)} className="p-2 border rounded" />
                <input required placeholder="Capacity (e.g. 40)" type="number" value={vCap} onChange={e => setVCap(e.target.value)} className="p-2 border rounded" />
                <input required placeholder="Driver Name" value={vDriver} onChange={e => setVDriver(e.target.value)} className="p-2 border rounded" />
                <input placeholder="Driver Phone" value={vPhone} onChange={e => setVPhone(e.target.value)} className="p-2 border rounded" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-medium">Save Vehicle</button>
            </form>
          )}

          {vehicles.length === 0 ? (
            <p className="text-gray-500 italic text-sm text-center py-4">No vehicles found.</p>
          ) : (
            <div className="space-y-4">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{v.registrationNo}</p>
                      <p className="text-sm text-gray-500">Driver: {v.driverName} ({v.driverPhone})</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Cap: {v.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Routes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Transport Routes</h2>
            <button 
              onClick={() => setShowRouteForm(!showRouteForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Add Route
            </button>
          </div>

          {showRouteForm && (
            <form onSubmit={handleCreateRoute} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <input required placeholder="Route Name (e.g. North City Route)" value={rName} onChange={e => setRName(e.target.value)} className="p-2 border rounded" />
                <textarea required placeholder="Stops (e.g. Stop A, Stop B)" value={rStops} onChange={e => setRStops(e.target.value)} className="p-2 border rounded"></textarea>
                <input required placeholder="Monthly Fee (₹)" type="number" value={rFee} onChange={e => setRFee(e.target.value)} className="p-2 border rounded" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-medium">Save Route</button>
            </form>
          )}

          {routes.length === 0 ? (
            <p className="text-gray-500 italic text-sm text-center py-4">No routes found.</p>
          ) : (
            <div className="space-y-4">
              {routes.map(r => (
                <div key={r.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{r.name}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">Stops: {r.stops}</p>
                    </div>
                    <div className="text-right whitespace-nowrap ml-4">
                      <p className="font-bold text-gray-900">₹{r.monthlyFee}/mo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
