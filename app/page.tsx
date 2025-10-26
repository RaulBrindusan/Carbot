'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDarkMode } from '@/lib/darkModeContext';
import Link from 'next/link';

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

interface Stats {
  totalCars: number;
  totalProfit: number;
  averageProfit: number;
  profitableCars: number;
}

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    totalProfit: 0,
    averageProfit: 0,
    profitableCars: 0,
  });
  const [loading, setLoading] = useState(true);
  const carsPerPage = 15;

  // Reset to page 1 if current page is beyond total pages
  useEffect(() => {
    const totalPages = Math.ceil(cars.length / carsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [cars.length, currentPage, carsPerPage]);

  useEffect(() => {
    // Listen to cars collection
    const carsQuery = query(
      collection(db, 'cars'),
      orderBy('profit', 'desc')
    );

    const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
      const carsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          carId: doc.id,
          makeModel: data.makeModel || '',
          fullTitle: data.fullTitle || '',
          year: data.year || '',
          profit: data.profit || 0,
          profitPercentage: data.profitPercentage || 0,
          totalCost: data.totalCost || 0,
          endAuctionPrice: data.endAuctionPrice || 0,
          createdAt: data.createdAt,
        } as Car;
      });

      // Sort by profit descending on client side to ensure proper ordering
      const sortedCars = [...carsData].sort((a, b) => (b.profit || 0) - (a.profit || 0));
      setCars(sortedCars);

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

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCars();
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ro-RO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-indigo-400 border-r-transparent' : 'border-indigo-600 border-r-transparent'}`}></div>
          <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Se încarcă tabloul de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Live Indicator & Dark Mode Toggle */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-sm border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          </div>
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full shadow-sm border ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'}`}>
            Live
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium mb-1">Total Mașini</p>
                <p className="text-2xl font-bold text-white">{stats.totalCars}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">Profit Mediu</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.averageProfit)}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium mb-1">Mașini Profitabile</p>
                <p className="text-2xl font-bold text-white">{stats.profitableCars}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cars */}
        <div className={`rounded-3xl p-8 border shadow-2xl ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'}`}>
            <div className="space-y-3 mb-6">
              {cars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage).map((car, index) => (
                <Link
                  key={car.carId}
                  href={`/car/${car.carId}`}
                  className={`group relative rounded-xl p-3 border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer block ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-indigo-400' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="absolute top-2 left-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
                    #{(currentPage - 1) * carsPerPage + index + 1}
                  </div>
                  <div className="flex justify-between items-start mb-2 pl-12">
                    <div className="flex-1">
                      <h3 className={`font-bold text-base group-hover:text-indigo-600 transition-colors ${isDarkMode ? 'text-gray-100 group-hover:text-indigo-400' : 'text-gray-900'}`}>{car.makeModel}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{car.fullTitle}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>{car.year}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pl-2">
                    <div className={`rounded-lg p-1.5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cost</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatCurrency(car.totalCost)}</p>
                    </div>
                    <div className={`rounded-lg p-1.5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preț Licitație</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatCurrency(car.endAuctionPrice)}</p>
                    </div>
                    <div className={`rounded-lg p-1.5 border ${isDarkMode ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-700' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'}`}>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Profit</p>
                      <p className={`font-bold text-sm ${car.profit > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : 'text-red-600'}`}>
                        {formatCurrency(car.profit)}
                      </p>
                    </div>
                    <div className={`rounded-lg p-1.5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Marjă</p>
                      <p className={`font-semibold text-sm ${car.profitPercentage > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : 'text-red-600'}`}>
                        {car.profitPercentage?.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`rounded-lg p-1.5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Adăugat</p>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(car.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {cars.length === 0 && (
                <div className="text-center py-12">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Nu s-au găsit mașini</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {cars.length > carsPerPage && (
              <div className={`flex justify-between items-center pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-center items-center gap-2 flex-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? (isDarkMode ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </button>

                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.ceil(cars.length / carsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        const totalPages = Math.ceil(cars.length / carsPerPage);
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1.5">
                            {showEllipsis && <span className={`px-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[32px] h-8 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                  : (isDarkMode
                                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-indigo-400'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-indigo-300')
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(cars.length / carsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(cars.length / carsPerPage)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === Math.ceil(cars.length / carsPerPage)
                        ? (isDarkMode ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Următor
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'}`}>
                  <svg className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Pagina {currentPage} / {Math.ceil(cars.length / carsPerPage)}
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
