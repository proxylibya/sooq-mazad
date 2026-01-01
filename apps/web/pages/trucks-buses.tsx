import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';

// ?????? ????? ???????? ?????????
const trucksData = [
  {
    id: 1,
    title: '????? ?????? ?????? 2019',
    price: 85000,
    location: '??????',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop&auto=format&q=80',
    condition: '?????',
    brand: '??????',
    model: '??????',
    year: 2019,
    mileage: 120000,
    type: '?????',
    capacity: '40 ??',
    fuelType: '????',
    seller: '???? ????? ???????',
    phone: '091-234-5678',
    views: 456,
    posted: '2024-01-15',
  },
  {
    id: 2,
    title: '????? ????? ?????? 2018',
    price: 65000,
    location: '??????',
    image:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop&auto=format&q=80',
    condition: '???',
    brand: '?????',
    model: '9700',
    year: 2018,
    mileage: 180000,
    type: '?????',
    capacity: '50 ????',
    fuelType: '????',
    seller: '???? ?????',
    phone: '092-345-6789',
    views: 289,
    posted: '2024-01-14',
  },
  {
    id: 3,
    title: '????? ?????? ????????? 2020',
    price: 72000,
    location: '??????',
    image:
      'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop&auto=format&q=80',
    condition: '?????',
    brand: '??????',
    model: '?????????',
    year: 2020,
    mileage: 95000,
    type: '?????',
    capacity: '25 ??',
    fuelType: '????',
    seller: '???? ?????',
    phone: '091-456-7890',
    views: 334,
    posted: '2024-01-13',
  },
  {
    id: 4,
    title: '????? ??? ???? ???? 2017',
    price: 58000,
    location: '???????',
    image: '/api/placeholder/300/200',
    condition: '???',
    brand: '???',
    model: '???? ????',
    year: 2017,
    mileage: 220000,
    type: '?????',
    capacity: '45 ????',
    fuelType: '????',
    seller: '???? ?????????',
    phone: '093-567-8901',
    views: 198,
    posted: '2024-01-12',
  },
  {
    id: 5,
    title: '????? ?????? R450 2021',
    price: 95000,
    location: '????',
    image: '/api/placeholder/300/200',
    condition: '????',
    brand: '??????',
    model: 'R450',
    year: 2021,
    mileage: 45000,
    type: '?????',
    capacity: '45 ??',
    fuelType: '????',
    seller: '???? ?????',
    phone: '094-678-9012',
    views: 567,
    posted: '2024-01-11',
  },
  {
    id: 6,
    title: '????? ????? 2016',
    price: 48000,
    location: '???????',
    image: '/api/placeholder/300/200',
    condition: '??????',
    brand: '?????',
    model: 'S416',
    year: 2016,
    mileage: 280000,
    type: '?????',
    capacity: '55 ????',
    fuelType: '????',
    seller: '???? ?????????',
    phone: '095-789-0123',
    views: 167,
    posted: '2024-01-10',
  },
];

const brands = [
  '???? ????????',
  '??????',
  '?????',
  '??????',
  '???',
  '??????',
  '?????',
  'DAF',
  '????',
  '????',
];

const types = ['???? ???????', '?????', '?????', '????? ?????', '????? ?????'];

const conditions = ['???? ???????', '????', '??????'];

const capacities = [
  '???? ???????',
  '??? ?? 10 ??',
  '10-20 ??',
  '20-30 ??',
  '30-40 ??',
  '???? ?? 40 ??',
];

const TrucksBusesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '???? ???????',
    brand: '???? ????????',
    condition: '???? ???????',
    capacity: '???? ???????',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    mileageFrom: '',
    mileageTo: '',
    location: '???? ?????',
  });
  const cities = [
    '???? ?????',
    '??????',
    '??????',
    '??????',
    '????',
    '???????',
    '???????',
    '????',
    '?????',
  ];

  return (
    <>
      <Head>
        <title>???????? ????????? - ???? ????????</title>
        <meta
          name="description"
          content="???? ???????? ????????? ??????? ?????????? ????? ??????? ?? ?????"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Mobile Sidebar Toggle */}
        <div className="border-b bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>???????</span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                ????????
              </Link>
              <span>?</span>
              <span className="text-gray-900">???????? ?????????</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">???????? ?????????</h1>
            <p className="text-gray-600">821 ????? ?????</p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div
              className={`${sidebarOpen ? 'block' : 'hidden'} h-fit w-full rounded-lg border bg-white p-6 shadow-sm lg:block lg:w-80`}
            >
              <h3 className="mb-4 font-semibold text-gray-900">????? ???????</h3>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">?????</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">???????</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">??????</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">???????</label>
                <select
                  value={filters.capacity}
                  onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {capacities.map((capacity) => (
                    <option key={capacity} value={capacity}>
                      {capacity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">??? ?????</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="??"
                    value={filters.yearFrom}
                    onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="???"
                    value={filters.yearTo}
                    onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ???? ????? (?????)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="??"
                    value={filters.priceFrom}
                    onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="???"
                    value={filters.priceTo}
                    onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Mileage Range */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ??????? ???????? (??)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="??"
                    value={filters.mileageFrom}
                    onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="???"
                    value={filters.mileageTo}
                    onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">???????</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                ????? ???????
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and View Options */}
              <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">??? 1-6 ?? 821 ?????</div>
                </div>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {trucksData.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={vehicle.image}
                        alt={vehicle.title}
                        className="h-48 w-full rounded-t-lg object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            vehicle.condition === '????'
                              ? 'bg-green-100 text-green-800'
                              : vehicle.condition === '?????'
                                ? 'bg-blue-100 text-blue-800'
                                : vehicle.condition === '???'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {vehicle.condition}
                        </span>
                      </div>
                      <div className="absolute left-2 top-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            vehicle.type === '?????'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {vehicle.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                        {vehicle.title}
                      </h3>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          {vehicle.price.toLocaleString()} ?.?
                        </span>
                        <span className="text-sm text-gray-500">{vehicle.location}</span>
                      </div>
                      <div className="mb-3 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>?????:</span>
                          <span>{vehicle.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>???????:</span>
                          <span>{vehicle.mileage.toLocaleString()} ??</span>
                        </div>
                        <div className="flex justify-between">
                          <span>???????:</span>
                          <span>{vehicle.capacity}</span>
                        </div>
                      </div>
                      <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                        <span>{vehicle.views} ??????</span>
                        <span>{vehicle.posted}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                          ???? ????
                        </button>
                        <button className="rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    ??????
                  </button>
                  <button className="rounded-lg bg-blue-600 px-3 py-2 text-white">1</button>
                  <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50">
                    2
                  </button>
                  <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50">
                    3
                  </button>
                  <span className="px-2">...</span>
                  <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50">
                    137
                  </button>
                  <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50">
                    ??????
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrucksBusesPage;
