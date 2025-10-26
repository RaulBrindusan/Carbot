'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDarkMode } from '@/lib/darkModeContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Car {
  carId: string;
  makeModel: string;
  fullTitle: string;
  year: string;
  profit: number;
  profitPercentage: number;
  totalCost: number;
  endAuctionPrice: number;
  auto1Link?: string;
  autovitLink?: string;
  url?: string;

  // Auto1 specific fields
  minimumBidPrice?: number;
  deliveryPrice?: number;
  totalRotiPrice?: number;

  // Autovit market data
  autovitAveragePrice?: number;
  autovitListingsCount?: number;
  autovitMaxPrice?: number;
  autovitMedianPrice?: number;
  autovitMinPrice?: number;

  // Car details
  fuelType?: string;
  cylinderCapacity?: string;
  odometerReading?: string;
  trimLevel?: string;
  countryOfRegistration?: string;

  // Additional fields
  mileage?: number;
  transmission?: string;
  engineSize?: number;
  power?: number;
  color?: string;
  bodyType?: string;
  doors?: number;
  seats?: number;
  vin?: string;
  registrationDate?: string;
  firstRegistration?: string;
  technicalInspectionDate?: string;
  emissionClass?: string;
  co2Emission?: number;
  fuelConsumption?: number;
  features?: string[];
  description?: string;
  images?: string[];
  location?: string;
  sellerType?: string;
  damageStatus?: string;
  previousOwners?: number;
  serviceHistory?: string;

  // Timestamps
  createdAt: any;
  updatedAt?: any;
  lastAnalyzed?: any;
}

export default function CarDetailsPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const params = useParams();
  const carId = params.carId as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        // Fetch car data
        const carDoc = await getDoc(doc(db, 'cars', carId));

        if (carDoc.exists()) {
          const data = carDoc.data();
          const carData = {
            carId: carDoc.id,
            ...data,
            // Map url field to auto1Link
            auto1Link: data.url || data.auto1Link,
          } as Car;

          setCar(carData);
        } else {
          setError('Car not found');
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

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
      year: 'numeric',
      month: 'long',
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
          <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Se încarcă detaliile mașinii...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Eroare</h1>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error || 'Mașina nu a fost găsită'}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
          >
            Înapoi la Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Dark Mode Toggle & Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'} shadow-sm`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Înapoi</span>
          </Link>

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
        </div>

        {/* Header */}
        <div className="mb-4">
          <h1 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.makeModel}</h1>
          <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{car.fullTitle}</p>
        </div>

        {/* Profit Analysis */}
        <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analiză Profit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cost Total</p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.totalCost)}</p>
            </div>
            <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Licitație</p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.endAuctionPrice)}</p>
            </div>
            <div className={`rounded-lg p-3 border ${car.profit > 0 ? (isDarkMode ? 'bg-emerald-900/30 border-emerald-700' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200') : (isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200')}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Profit</p>
              <p className={`text-lg font-bold ${car.profit > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{formatCurrency(car.profit)}</p>
            </div>
            <div className={`rounded-lg p-3 border ${car.profitPercentage > 0 ? (isDarkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200') : (isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200')}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Marjă Profit</p>
              <p className={`text-lg font-bold ${car.profitPercentage > 0 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{car.profitPercentage?.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Auto1 Price Information */}
        {(car.minimumBidPrice || car.deliveryPrice || car.totalRotiPrice) && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informații Preț Auto1</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {car.minimumBidPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Minim Licitație</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.minimumBidPrice)}</p>
                </div>
              )}
              {car.deliveryPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Livrare</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.deliveryPrice)}</p>
                </div>
              )}
              {car.totalRotiPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Total Roți</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.totalRotiPrice)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Autovit Market Data */}
        {(car.autovitAveragePrice || car.autovitMedianPrice || car.autovitMinPrice || car.autovitMaxPrice || car.autovitListingsCount) && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Date Piață Autovit</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {car.autovitAveragePrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Mediu</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.autovitAveragePrice)}</p>
                </div>
              )}
              {car.autovitMedianPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Median</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.autovitMedianPrice)}</p>
                </div>
              )}
              {car.autovitMinPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Minim</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.autovitMinPrice)}</p>
                </div>
              )}
              {car.autovitMaxPrice && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preț Maxim</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(car.autovitMaxPrice)}</p>
                </div>
              )}
              {car.autovitListingsCount && (
                <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Număr Anunțuri</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.autovitListingsCount}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Links */}
        <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vezi Mașina pe</h2>
          <div className="flex flex-wrap gap-3">
            {car.auto1Link ? (
              <a
                href={car.auto1Link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm">Vezi pe Auto1</span>
              </a>
            ) : null}

            {car.autovitLink ? (
              <a
                href={car.autovitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm">Vezi pe Autovit</span>
              </a>
            ) : null}

            {!car.auto1Link && !car.autovitLink && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nu există linkuri disponibile</p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        {(car.year || car.mileage || car.odometerReading || car.fuelType || car.transmission || car.engineSize || car.cylinderCapacity || car.power || car.color || car.bodyType || car.doors || car.seats || car.trimLevel || car.countryOfRegistration) && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informații de Bază</h2>
            <div className="grid grid-cols-3 gap-3">
                {car.year && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>An</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.year}</p>
                  </div>
                )}
                {car.mileage && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kilometraj</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.mileage.toLocaleString()} km</p>
                  </div>
                )}
                {car.odometerReading && !car.mileage && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kilometraj</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.odometerReading}</p>
                  </div>
                )}
                {car.fuelType && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Combustibil</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.fuelType}</p>
                  </div>
                )}
                {car.transmission && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transmisie</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.transmission}</p>
                  </div>
                )}
                {car.engineSize && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Capacitate Motor</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.engineSize}L</p>
                  </div>
                )}
                {car.cylinderCapacity && !car.engineSize && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Capacitate Motor</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.cylinderCapacity}</p>
                  </div>
                )}
                {car.power && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Putere</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.power} CP</p>
                  </div>
                )}
                {car.trimLevel && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Versiune</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.trimLevel}</p>
                  </div>
                )}
                {car.color && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Culoare</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.color}</p>
                  </div>
                )}
                {car.bodyType && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tip Caroserie</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.bodyType}</p>
                  </div>
                )}
                {car.doors && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uși</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.doors}</p>
                  </div>
                )}
                {car.seats && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Locuri</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.seats}</p>
                  </div>
                )}
                {car.countryOfRegistration && (
                  <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Țară Înmatriculare</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.countryOfRegistration}</p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {(car.vin || car.registrationDate || car.firstRegistration || car.technicalInspectionDate || car.emissionClass || car.co2Emission || car.fuelConsumption || car.location || car.sellerType || car.previousOwners) && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detalii Tehnice</h2>
            <div className="space-y-2">
              {car.vin && <DetailRow label="VIN" value={car.vin} isDarkMode={isDarkMode} />}
              {car.registrationDate && <DetailRow label="Data Înmatriculare" value={car.registrationDate} isDarkMode={isDarkMode} />}
              {car.firstRegistration && <DetailRow label="Prima Înmatriculare" value={car.firstRegistration} isDarkMode={isDarkMode} />}
              {car.technicalInspectionDate && <DetailRow label="ITP" value={car.technicalInspectionDate} isDarkMode={isDarkMode} />}
              {car.emissionClass && <DetailRow label="Clasă Emisii" value={car.emissionClass} isDarkMode={isDarkMode} />}
              {car.co2Emission && <DetailRow label="Emisii CO2" value={`${car.co2Emission} g/km`} isDarkMode={isDarkMode} />}
              {car.fuelConsumption && <DetailRow label="Consum" value={`${car.fuelConsumption} L/100km`} isDarkMode={isDarkMode} />}
              {car.location && <DetailRow label="Locație" value={car.location} isDarkMode={isDarkMode} />}
              {car.sellerType && <DetailRow label="Tip Vânzător" value={car.sellerType} isDarkMode={isDarkMode} />}
              {car.previousOwners && <DetailRow label="Proprietari Anteriori" value={car.previousOwners} isDarkMode={isDarkMode} />}
            </div>
          </div>
        )}

        {/* Condition & Features */}
        {(car.damageStatus || car.serviceHistory || (car.features && car.features.length > 0)) && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stare & Dotări</h2>
            <div className="space-y-3">
              {car.damageStatus && (
                <div>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stare Daună</p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.damageStatus}</p>
                </div>
              )}
              {car.serviceHistory && (
                <div>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Istoric Service</p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{car.serviceHistory}</p>
                </div>
              )}
              {car.features && car.features.length > 0 && (
                <div>
                  <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dotări</p>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 text-indigo-300 border border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200'}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {car.description && (
          <div className={`rounded-xl p-5 shadow-xl mb-4 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Descriere</h2>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{car.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className={`rounded-xl p-5 shadow-xl ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-200'}`}>
          <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Metadata</h2>
          <div className="space-y-2">
            <DetailRow label="ID Mașină" value={car.carId} isDarkMode={isDarkMode} />
            <DetailRow label="Creat la" value={formatDate(car.createdAt)} isDarkMode={isDarkMode} />
            {car.updatedAt && <DetailRow label="Actualizat la" value={formatDate(car.updatedAt)} isDarkMode={isDarkMode} />}
            {car.lastAnalyzed && <DetailRow label="Ultima Analiză" value={formatDate(car.lastAnalyzed)} isDarkMode={isDarkMode} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value, isDarkMode }: { label: string; value: string | number; isDarkMode: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
