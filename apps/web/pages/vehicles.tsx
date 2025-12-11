import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
// // import { useSession } from 'next-auth/react'; // ?? ????? ???? ???????? ?????? // ?? ????? ???? ???????? ??????
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../components/common';
import { useFavorites } from '../hooks/useFavorites';

// ?? ??? ???????? ??????? ????????
const vehiclesData = [];

const vehicleTypes = [
  '???? ???????',
  '?????',
  '????? ?????',
  '?????',
  '?????',
  '??? ?????',
  '??????',
];

const brands = [
  '???? ????????',
  '??????',
  '?????',
  '?????',
  '??????',
  'BMW',
  '????',
  '?????',
  '????????',
  '???????',
];

const conditions = ['???? ???????', '????', '??????', '????? ?????'];

const fuelTypes = ['???? ????? ??????', '?????', '????', '????', '???????'];

const VehiclesPage = () => {
  // ?????? ???? ????? ?????? - ???? ????? ????? ???????? ??????
  const session = { user: { name: '???????? ????????' } };
  const router = useRouter();

  // ??????? hook ??????? ??????
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [filters, setFilters] = useState({
    type: '???? ???????',
    brand: '???? ????????',
    condition: '???? ???????',
    fuelType: '???? ????? ??????',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    mileageFrom: '',
    mileageTo: '',
    location: '???? ?????',
  });

  // ???? ????? ?????????
  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // ???? ?????? ?? ????? ??????
  const requireLogin = (action: string, callback?: () => void) => {
    if (!session) {
      showNotification('warning', `??? ????? ?????? ????? ${action}`);
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return false;
    }
    if (callback) callback();
    return true;
  };

  const handleContactClick = (vehicle: any) => {
    requireLogin('??????? ???????', () => {
      showNotification('success', `?? ??? ??? ???? ${vehicle.seller}`);
    });
  };

  const handleFavoriteClick = async (vehicle: any) => {
    if (!requireLogin('?????? ??????? ???????')) {
      return;
    }

    const vehicleId = vehicle.id.toString();
    const success = await toggleFavorite(vehicleId);

    if (success) {
      const isNowFavorite = isFavorite(vehicleId);
      showNotification(
        isNowFavorite ? 'success' : 'warning',
        isNowFavorite ? '?? ????? ??????? ???????' : '?? ????? ??????? ?? ???????',
      );
    } else {
      showNotification('error', '??? ??? ?? ????? ???????');
    }
  };

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

  // ???????? ?????
  const quickStats = [
    { title: '????????', count: '15,234', link: '/marketplace' },
    { title: '???????? ???????', count: '1,211', link: '/motorcycles' },
    { title: '???????? ?????????', count: '821', link: '/trucks-buses' },
    { title: '??????? ???????', count: '365', link: '/heavy-machinery' },
    { title: '??? ??????', count: '2,528', link: '/car-parts' },
    { title: '???????????', count: '315', link: '/car-accessories' },
  ];

  return (
    <>
      <Head>
        <title>???? ???????? ????????? - ???? ????????</title>
        <meta name="description" content="???? ???? ???????? ????????? ??????? ????? ?? ?????" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* ??????? ?????? */}
        {notification.show && (
          <div className="fixed right-4 top-4 z-50 max-w-sm">
            <div
              className={`rounded-lg border-r-4 p-4 shadow-lg ${
                notification.type === 'success'
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : notification.type === 'error'
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-yellow-400 bg-yellow-50 text-yellow-800'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className="mr-2 flex-shrink-0"
                >
                  ?
                </button>
              </div>
            </div>
          </div>
        )}

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
              <span className="text-gray-900">???? ???????? ?????????</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">???? ???????? ?????????</h1>
            <p className="text-gray-600">20,474 ????? ?????</p>
          </div>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickStats.map((stat, index) => (
              <Link
                key={index}
                href={stat.link}
                className="rounded-lg border bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-1 text-2xl font-bold text-blue-600">{stat.count}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </Link>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div
              className={`${sidebarOpen ? 'block' : 'hidden'} h-fit w-full rounded-lg border bg-white p-6 shadow-sm lg:block lg:w-80`}
            >
              <h3 className="mb-4 font-semibold text-gray-900">????? ???????</h3>

              {/* Vehicle Type Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">??? ???????</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {vehicleTypes.map((type) => (
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

              {/* Fuel Type Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">??? ??????</label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {fuelTypes.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
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
                  <div className="text-sm text-gray-600">??? 1-6 ?? 20,474 ?????</div>
                </div>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {vehiclesData.map((vehicle) => (
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
                              ? 'bg-blue-100 text-blue-800'
                              : vehicle.type === '????? ?????'
                                ? 'bg-purple-100 text-purple-800'
                                : vehicle.type === '?????'
                                  ? 'bg-orange-100 text-orange-800'
                                  : vehicle.type === '?????'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
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
                          <span>
                            {vehicle.mileage.toLocaleString()}{' '}
                            {vehicle.type === '??? ?????' ? '????' : '??'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>??????:</span>
                          <span>{vehicle.fuelType}</span>
                        </div>
                      </div>
                      <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                        <span>{vehicle.views} ??????</span>
                        <span>{vehicle.posted}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleContactClick(vehicle)}
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          ???? ????
                        </button>
                        <button
                          onClick={() => handleFavoriteClick(vehicle)}
                          className="rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50"
                          title="????? ???????"
                        >
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
                    3,413
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

export default VehiclesPage;
