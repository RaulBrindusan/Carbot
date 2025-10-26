'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Car {
  carId: string;
  makeModel: string;
  fullTitle: string;
  year: string;
  profit: number;
  profitPercentage: number;
  totalCost: number;
  endAuctionPrice: number;
  createdAt: any;
}

interface BatchRun {
  batchRunId: string;
  startTime: any;
  endTime: any;
  totalCars: number;
  successfulCars: number;
  failedCars: number;
  averageProfit: number;
  totalProfit: number;
  highestProfit: number;
  profitableCars: number;
  status: string;
}

interface Stats {
  totalCars: number;
  totalProfit: number;
  averageProfit: number;
  profitableCars: number;
}

export default function Dashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [batchRuns, setBatchRuns] = useState<BatchRun[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    totalProfit: 0,
    averageProfit: 0,
    profitableCars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to cars collection
    const carsQuery = query(
      collection(db, 'cars'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
      const carsData = snapshot.docs.map((doc) => ({
        carId: doc.id,
        ...doc.data(),
      })) as Car[];
      setCars(carsData);

      // Calculate stats
      const total = snapshot.size;
      const profitable = carsData.filter((car) => car.profit > 0).length;
      const totalProfitSum = carsData.reduce((sum, car) => sum + (car.profit || 0), 0);
      const avgProfit = total > 0 ? totalProfitSum / total : 0;

      setStats({
        totalCars: total,
        totalProfit: totalProfitSum,
        averageProfit: avgProfit,
        profitableCars: profitable,
      });

      setLoading(false);
    });

    // Listen to batchRuns collection
    const batchRunsQuery = query(
      collection(db, 'batchRuns'),
      orderBy('startTime', 'desc'),
      limit(5)
    );

    const unsubscribeBatchRuns = onSnapshot(batchRunsQuery, (snapshot) => {
      const batchRunsData = snapshot.docs.map((doc) => ({
        batchRunId: doc.id,
        ...doc.data(),
      })) as BatchRun[];
      setBatchRuns(batchRunsData);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCars();
      unsubscribeBatchRuns();
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Car Analytics Dashboard</h1>
          <p className="text-purple-200">Real-time insights and statistics</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-300">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Cars</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalCars}</p>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-xl">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Profit</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(stats.totalProfit)}</p>
              </div>
              <div className="bg-green-500/20 p-4 rounded-xl">
                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Avg Profit</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{formatCurrency(stats.averageProfit)}</p>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-xl">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Profitable Cars</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.profitableCars}</p>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-xl">
                <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cars */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Cars</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {cars.map((car) => (
                <div
                  key={car.carId}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{car.makeModel}</h3>
                      <p className="text-purple-200 text-sm">{car.fullTitle}</p>
                    </div>
                    <span className="text-purple-200 text-sm">{car.year}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-purple-300">Cost</p>
                      <p className="text-white font-medium">{formatCurrency(car.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-300">Auction Price</p>
                      <p className="text-white font-medium">{formatCurrency(car.endAuctionPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-300">Profit</p>
                      <p className={`font-medium ${car.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(car.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-300">Margin</p>
                      <p className={`font-medium ${car.profitPercentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {car.profitPercentage?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-purple-300">
                      Added {formatDate(car.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {cars.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-purple-200">No cars found</p>
                </div>
              )}
            </div>
          </div>

          {/* Batch Runs */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Batches</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {batchRuns.map((batch) => (
                <div
                  key={batch.batchRunId}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'completed'
                        ? 'bg-green-500/20 text-green-300'
                        : batch.status === 'running'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Total Cars</span>
                      <span className="text-white font-medium">{batch.totalCars}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Successful</span>
                      <span className="text-green-400 font-medium">{batch.successfulCars}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Failed</span>
                      <span className="text-red-400 font-medium">{batch.failedCars}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-purple-300 text-sm">Total Profit</span>
                        <span className="text-green-400 font-medium">{formatCurrency(batch.totalProfit)}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-purple-300">
                        {formatDate(batch.startTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {batchRuns.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-purple-200">No batch runs found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
