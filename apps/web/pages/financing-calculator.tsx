import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { OpensooqNavbar } from '../components/common';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowDownIcon from '@heroicons/react/24/outline/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/outline/ArrowUpIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';

// صفحة حاسبة التمويل
const FinancingCalculatorPage = () => {
  const [formData, setFormData] = useState({
    carPrice: '',
    downPayment: '',
    downPaymentPercent: '20',
    loanTerm: '5',
    interestRate: '8.5',
    insuranceRate: '2.5',
    maintenanceRate: '1.5',
    bankType: 'conventional', // conventional, islamic
    carType: 'new', // new, used
    employmentType: 'employee', // employee, business, freelancer
    monthlyIncome: '',
    existingLoans: '',
  });

  const [results, setResults] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0,
    monthlyInsurance: 0,
    monthlyMaintenance: 0,
    totalMonthlyPayment: 0,
    debtToIncomeRatio: 0,
    affordabilityScore: 0,
    recommendedMaxPrice: 0,
    totalCostOfOwnership: 0,
    breakEvenPoint: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator'); // calculator, comparison, tips
  const [comparisonScenarios, setComparisonScenarios] = useState<Array<any>>([]);
  const [paymentSchedule, setPaymentSchedule] = useState<
    Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>
  >([]);

  // تحديث النتائج عند تغيير البيانات
  useEffect(() => {
    if (formData.carPrice && parseFloat(formData.carPrice) > 0) {
      calculateFinancing();
    }
  }, [formData]);

  // حساب التمويل
  const calculateFinancing = () => {
    const carPrice = parseFloat(formData.carPrice) || 0;
    const downPayment = formData.downPayment
      ? parseFloat(formData.downPayment)
      : (carPrice * parseFloat(formData.downPaymentPercent)) / 100;

    const loanAmount = carPrice - downPayment;
    const monthlyRate = parseFloat(formData.interestRate) / 100 / 12;
    const numberOfPayments = parseFloat(formData.loanTerm) * 12;

    // حساب القسط الشهري
    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalAmount = monthlyPayment * numberOfPayments;
    const totalInterest = totalAmount - loanAmount;

    // حساب التأمين والصيانة
    const monthlyInsurance = (carPrice * parseFloat(formData.insuranceRate)) / 100 / 12;
    const monthlyMaintenance = (carPrice * parseFloat(formData.maintenanceRate)) / 100 / 12;
    const totalMonthlyPayment = monthlyPayment + monthlyInsurance + monthlyMaintenance;

    // حساب المعايير الإضافية
    const monthlyIncome = parseFloat(formData.monthlyIncome) || 0;
    const existingLoans = parseFloat(formData.existingLoans) || 0;
    const debtToIncomeRatio =
      monthlyIncome > 0 ? ((totalMonthlyPayment + existingLoans) / monthlyIncome) * 100 : 0;

    // حساب نقاط القدرة على التحمل
    let affordabilityScore = 100;
    if (debtToIncomeRatio > 40) affordabilityScore -= 30;
    else if (debtToIncomeRatio > 30) affordabilityScore -= 15;

    if (downPayment < carPrice * 0.2) affordabilityScore -= 20;
    if (parseFloat(formData.loanTerm) > 5) affordabilityScore -= 10;

    // حساب السعر الأقصى المُوصى به
    const maxRecommendedPayment = monthlyIncome * 0.3; // 30% من الدخل
    const recommendedMaxPrice =
      maxRecommendedPayment > 0
        ? (maxRecommendedPayment - monthlyInsurance - monthlyMaintenance) * numberOfPayments +
          downPayment
        : 0;

    // حساب التكلفة الإجمالية للملكية (5 سنوات)
    const totalCostOfOwnership =
      carPrice + totalInterest + monthlyInsurance * 60 + monthlyMaintenance * 60;

    // نقطة التعادل (متى تصبح الملكية أفضل من الإيجار)
    const averageRentalCost = carPrice * 0.02; // 2% من قيمة السيارة شهرياً
    const breakEvenPoint =
      totalMonthlyPayment > 0 ? carPrice / (totalMonthlyPayment - averageRentalCost) : 0;

    setResults({
      loanAmount,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
      monthlyInsurance,
      monthlyMaintenance,
      totalMonthlyPayment: isNaN(totalMonthlyPayment) ? 0 : totalMonthlyPayment,
      debtToIncomeRatio,
      affordabilityScore: Math.max(0, affordabilityScore),
      recommendedMaxPrice,
      totalCostOfOwnership,
      breakEvenPoint,
    });

    // إنشاء جدول الدفع
    generatePaymentSchedule(loanAmount, monthlyPayment, monthlyRate, numberOfPayments);
    setShowResults(true);
  };

  // إنشاء جدول الدفع
  const generatePaymentSchedule = (
    loanAmount: number,
    monthlyPayment: number,
    monthlyRate: number,
    numberOfPayments: number,
  ) => {
    const schedule = [];
    let remainingBalance = loanAmount;

    for (let i = 1; i <= Math.min(numberOfPayments, 12); i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
      });
    }

    setPaymentSchedule(schedule);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // تحديث الدفعة المقدمة عند تغيير النسبة المئوية
    if (field === 'downPaymentPercent' && formData.carPrice) {
      const newDownPayment = (parseFloat(formData.carPrice) * parseFloat(value)) / 100;
      setFormData((prev) => ({
        ...prev,
        downPayment: newDownPayment.toString(),
      }));
    }

    // تحديث النسبة المئوية عند تغيير الدفعة المقدمة
    if (field === 'downPayment' && formData.carPrice) {
      const newPercent = (parseFloat(value) / parseFloat(formData.carPrice)) * 100;
      setFormData((prev) => ({
        ...prev,
        downPaymentPercent: newPercent.toFixed(1),
      }));
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-LY', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ar-LY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <>
      <Head>
        <title>حاسبة التمويل - مزاد السيارات</title>
        <meta
          name="description"
          content="احسب قسط التمويل الشهري لسيارتك مع حاسبة التمويل المتقدمة"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                  <CalculatorIcon className="h-8 w-8 text-blue-600" />
                  حاسبة التمويل
                </h1>
                <p className="mt-2 text-gray-600">احسب قسط التمويل الشهري لسيارتك بدقة</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                  <PrinterIcon className="h-5 w-5" />
                  طباعة
                </button>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                  <ShareIcon className="h-5 w-5" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* التبويبات */}
          <div className="mb-8 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('calculator')}
                  className={`border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === 'calculator'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalculatorIcon className="h-5 w-5" />
                    حاسبة التمويل
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === 'comparison'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5" />
                    مقارنة السيناريوهات
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('tips')}
                  className={`border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === 'tips'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <InformationCircleIcon className="h-5 w-5" />
                    نصائح التمويل
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Calculator Form */}
              <div className="lg:col-span-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-xl font-bold text-gray-900">بيانات التمويل</h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* سعر السيارة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        سعر السيارة (د.ل)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.carPrice}
                          onChange={(e) => handleInputChange('carPrice', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: 300000"
                        />
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      </div>
                    </div>

                    {/* الدفعة المقدمة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        الدفعة المقدمة (د.ل)
                      </label>
                      <input
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) => handleInputChange('downPayment', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 60000"
                      />
                    </div>

                    {/* نسبة الدفعة المقدمة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        نسبة الدفعة المقدمة (%)
                      </label>
                      <select
                        value={formData.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                        <option value="25">25%</option>
                        <option value="30">30%</option>
                        <option value="35">35%</option>
                        <option value="40">40%</option>
                      </select>
                    </div>

                    {/* مدة التمويل */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        مدة التمويل (سنوات)
                      </label>
                      <select
                        value={formData.loanTerm}
                        onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">سنة واحدة</option>
                        <option value="2">سنتان</option>
                        <option value="3">3 سنوات</option>
                        <option value="4">4 سنوات</option>
                        <option value="5">5 سنوات</option>
                        <option value="6">6 سنوات</option>
                        <option value="7">7 سنوات</option>
                      </select>
                    </div>

                    {/* معدل الفائدة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        معدل الفائدة السنوي (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 8.5"
                      />
                    </div>

                    {/* معدل التأمين */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        معدل التأمين السنوي (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.insuranceRate}
                        onChange={(e) => handleInputChange('insuranceRate', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 2.5"
                      />
                    </div>
                    {/* نوع البنك */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        نوع التمويل
                      </label>
                      <select
                        value={formData.bankType}
                        onChange={(e) => handleInputChange('bankType', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="conventional">تمويل تقليدي</option>
                        <option value="islamic">تمويل إسلامي</option>
                      </select>
                    </div>

                    {/* نوع السيارة */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        نوع السيارة
                      </label>
                      <select
                        value={formData.carType}
                        onChange={(e) => handleInputChange('carType', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">سيارة جديدة</option>
                        <option value="used">سيارة مستعملة</option>
                      </select>
                    </div>

                    {/* نوع العمل */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        نوع العمل
                      </label>
                      <select
                        value={formData.employmentType}
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="employee">موظف</option>
                        <option value="business">صاحب عمل</option>
                        <option value="freelancer">عمل حر</option>
                      </select>
                    </div>

                    {/* الدخل الشهري */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        الدخل الشهري (د.ل) - اختياري
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 3000"
                      />
                    </div>

                    {/* القروض الحالية */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        أقساط القروض الحالية (د.ل) - اختياري
                      </label>
                      <input
                        type="number"
                        value={formData.existingLoans}
                        onChange={(e) => handleInputChange('existingLoans', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 500"
                      />
                    </div>
                  </div>

                  {/* معلومات إضافية */}
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div className="text-sm text-blue-800">
                        <p className="mb-1 font-medium">ملاحظات مهمة:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• الحسابات تقديرية وقد تختلف حسب شروط البنك</li>
                          <li>• لا تشمل الرسوم الإدارية والتأمين الإجباري</li>
                          <li>• يُنصح بمراجعة البنك للحصول على عرض دقيق</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-1">
                {showResults && (
                  <div className="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <ChartBarIcon className="h-5 w-5 text-green-600" />
                      نتائج الحساب
                    </h3>

                    <div className="space-y-4">
                      {/* مبلغ القرض */}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-sm text-gray-600">مبلغ القرض</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatNumber(results.loanAmount)} د.ل
                        </div>
                      </div>

                      {/* القسط الشهري */}
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="text-sm text-blue-600">القسط الشهري (أساسي)</div>
                        <div className="text-xl font-bold text-blue-700">
                          {formatCurrency(results.monthlyPayment)} د.ل
                        </div>
                      </div>

                      {/* التأمين الشهري */}
                      <div className="rounded-lg bg-orange-50 p-3">
                        <div className="text-sm text-orange-600">التأمين الشهري</div>
                        <div className="text-lg font-bold text-orange-700">
                          {formatCurrency(results.monthlyInsurance)} د.ل
                        </div>
                      </div>

                      {/* الصيانة الشهرية */}
                      <div className="rounded-lg bg-purple-50 p-3">
                        <div className="text-sm text-purple-600">الصيانة الشهرية (تقديرية)</div>
                        <div className="text-lg font-bold text-purple-700">
                          {formatCurrency(results.monthlyMaintenance)} د.ل
                        </div>
                      </div>

                      {/* إجمالي القسط الشهري */}
                      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                        <div className="text-sm text-green-600">إجمالي القسط الشهري</div>
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(results.totalMonthlyPayment)} د.ل
                        </div>
                      </div>

                      {/* إجمالي الفوائد */}
                      <div className="rounded-lg bg-red-50 p-3">
                        <div className="text-sm text-red-600">إجمالي الفوائد</div>
                        <div className="text-lg font-bold text-red-700">
                          {formatNumber(results.totalInterest)} د.ل
                        </div>
                      </div>

                      {/* إجمالي المبلغ */}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-sm text-gray-600">إجمالي المبلغ المدفوع</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatNumber(results.totalAmount)} د.ل
                        </div>
                      </div>

                      {/* المعايير الإضافية */}
                      {formData.monthlyIncome && parseFloat(formData.monthlyIncome) > 0 && (
                        <>
                          {/* نسبة الدين إلى الدخل */}
                          <div
                            className={`rounded-lg p-3 ${
                              results.debtToIncomeRatio > 40
                                ? 'border border-red-200 bg-red-50'
                                : results.debtToIncomeRatio > 30
                                  ? 'border border-yellow-200 bg-yellow-50'
                                  : 'border border-green-200 bg-green-50'
                            }`}
                          >
                            <div
                              className={`text-sm ${
                                results.debtToIncomeRatio > 40
                                  ? 'text-red-600'
                                  : results.debtToIncomeRatio > 30
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                              }`}
                            >
                              نسبة الدين إلى الدخل
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                results.debtToIncomeRatio > 40
                                  ? 'text-red-700'
                                  : results.debtToIncomeRatio > 30
                                    ? 'text-yellow-700'
                                    : 'text-green-700'
                              }`}
                            >
                              {results.debtToIncomeRatio.toFixed(1)}%
                            </div>
                            <div className="mt-1 text-xs opacity-75">
                              {results.debtToIncomeRatio > 40
                                ? 'مرتفع - قد يكون صعب الحصول على الموافقة'
                                : results.debtToIncomeRatio > 30
                                  ? 'متوسط - يحتاج مراجعة'
                                  : 'جيد - ضمن المعدل المقبول'}
                            </div>
                          </div>

                          {/* نقاط القدرة على التحمل */}
                          <div
                            className={`rounded-lg p-3 ${
                              results.affordabilityScore >= 80
                                ? 'border border-green-200 bg-green-50'
                                : results.affordabilityScore >= 60
                                  ? 'border border-yellow-200 bg-yellow-50'
                                  : 'border border-red-200 bg-red-50'
                            }`}
                          >
                            <div
                              className={`text-sm ${
                                results.affordabilityScore >= 80
                                  ? 'text-green-600'
                                  : results.affordabilityScore >= 60
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              نقاط القدرة على التحمل
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                results.affordabilityScore >= 80
                                  ? 'text-green-700'
                                  : results.affordabilityScore >= 60
                                    ? 'text-yellow-700'
                                    : 'text-red-700'
                              }`}
                            >
                              {results.affordabilityScore.toFixed(0)}/100
                            </div>
                          </div>

                          {/* السعر الأقصى المُوصى به */}
                          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                            <div className="text-sm text-indigo-600">السعر الأقصى المُوصى به</div>
                            <div className="text-lg font-bold text-indigo-700">
                              {formatNumber(results.recommendedMaxPrice)} د.ل
                            </div>
                            <div className="mt-1 text-xs text-indigo-600">
                              بناءً على 30% من دخلكم الشهري
                            </div>
                          </div>
                        </>
                      )}

                      {/* التكلفة الإجمالية للملكية */}
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <div className="text-sm text-purple-600">
                          التكلفة الإجمالية للملكية (5 سنوات)
                        </div>
                        <div className="text-lg font-bold text-purple-700">
                          {formatNumber(results.totalCostOfOwnership)} د.ل
                        </div>
                        <div className="mt-1 text-xs text-purple-600">
                          شامل السعر + الفوائد + التأمين + الصيانة
                        </div>
                      </div>
                    </div>

                    {/* نصائح */}
                    <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      <div className="text-sm text-yellow-800">
                        <p className="mb-1 font-medium">💡 نصائح لتوفير المال:</p>
                        <ul className="space-y-1 text-xs text-yellow-700">
                          <li>• زيادة الدفعة المقدمة تقلل القسط الشهري</li>
                          <li>• مقارنة عروض البنوك المختلفة</li>
                          <li>• اختيار مدة تمويل مناسبة لدخلك</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Schedule */}
              {showResults && paymentSchedule.length > 0 && (
                <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    جدول الدفع (أول 12 شهر)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-3 text-right font-medium text-gray-900">الشهر</th>
                          <th className="p-3 text-right font-medium text-gray-900">القسط</th>
                          <th className="p-3 text-right font-medium text-gray-900">أصل المبلغ</th>
                          <th className="p-3 text-right font-medium text-gray-900">الفوائد</th>
                          <th className="p-3 text-right font-medium text-gray-900">
                            الرصيد المتبقي
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentSchedule.map((payment) => (
                          <tr key={payment.month} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{payment.month}</td>
                            <td className="p-3">{formatCurrency(payment.payment)} د.ل</td>
                            <td className="p-3 text-green-600">
                              {formatCurrency(payment.principal)} د.ل
                            </td>
                            <td className="p-3 text-red-600">
                              {formatCurrency(payment.interest)} د.ل
                            </td>
                            <td className="p-3">{formatCurrency(payment.balance)} د.ل</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تبويب مقارنة السيناريوهات */}
          {activeTab === 'comparison' && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                مقارنة السيناريوهات
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* سيناريو 1: دفعة مقدمة أقل */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <ArrowDownIcon className="h-5 w-5 text-red-500" />
                    دفعة مقدمة أقل (10%)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الدفعة المقدمة:</span>
                      <span className="font-medium">
                        {formatNumber(parseFloat(formData.carPrice || '0') * 0.1)} د.ل
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">مبلغ القرض:</span>
                      <span className="font-medium">
                        {formatNumber(parseFloat(formData.carPrice || '0') * 0.9)} د.ل
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القسط الشهري:</span>
                      <span className="font-medium text-red-600">أعلى</span>
                    </div>
                  </div>
                </div>

                {/* سيناريو 2: الحالي */}
                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    السيناريو الحالي ({formData.downPaymentPercent}%)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">الدفعة المقدمة:</span>
                      <span className="font-medium">
                        {formatNumber(
                          results.loanAmount
                            ? parseFloat(formData.carPrice || '0') - results.loanAmount
                            : 0,
                        )}{' '}
                        د.ل
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">مبلغ القرض:</span>
                      <span className="font-medium">{formatNumber(results.loanAmount)} د.ل</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">القسط الشهري:</span>
                      <span className="font-medium">
                        {formatCurrency(results.totalMonthlyPayment)} د.ل
                      </span>
                    </div>
                  </div>
                </div>

                {/* سيناريو 3: دفعة مقدمة أكبر */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    دفعة مقدمة أكبر (30%)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الدفعة المقدمة:</span>
                      <span className="font-medium">
                        {formatNumber(parseFloat(formData.carPrice || '0') * 0.3)} د.ل
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">مبلغ القرض:</span>
                      <span className="font-medium">
                        {formatNumber(parseFloat(formData.carPrice || '0') * 0.7)} د.ل
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القسط الشهري:</span>
                      <span className="font-medium text-green-600">أقل</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-900">
                  <InformationCircleIcon className="h-5 w-5" />
                  نصائح للمقارنة
                </h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• دفعة مقدمة أكبر = قسط شهري أقل + فوائد أقل</li>
                  <li>• دفعة مقدمة أقل = سيولة أكثر + قسط شهري أعلى</li>
                  <li>• اختر ما يناسب وضعك المالي الحالي والمستقبلي</li>
                </ul>
              </div>
            </div>
          )}

          {/* تبويب نصائح التمويل */}
          {activeTab === 'tips' && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                نصائح التمويل
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* نصائح قبل التقديم */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <DocumentTextIcon className="h-5 w-5 text-green-600" />
                    قبل التقديم
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-medium text-green-900">تحضير الوثائق</h4>
                      <ul className="space-y-1 text-sm text-green-800">
                        <li>• كشف راتب آخر 3 أشهر</li>
                        <li>• كشف حساب بنكي آخر 6 أشهر</li>
                        <li>• صورة من الهوية الشخصية</li>
                        <li>• شهادة عمل أو عقد عمل</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-medium text-blue-900">تحسين الملف الائتماني</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• سداد جميع الديون المتأخرة</li>
                        <li>• تجنب طلب قروض جديدة</li>
                        <li>• الحفاظ على رصيد بنكي جيد</li>
                        <li>• مراجعة التقرير الائتماني</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* نصائح أثناء التمويل */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CreditCardIcon className="h-5 w-5 text-orange-600" />
                    أثناء التمويل
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <h4 className="mb-2 font-medium text-orange-900">إدارة الأقساط</h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>• إعداد تحويل تلقائي للأقساط</li>
                        <li>• الدفع قبل تاريخ الاستحقاق</li>
                        <li>• الاحتفاظ بإيصالات الدفع</li>
                        <li>• مراقبة الرصيد المتبقي</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <h4 className="mb-2 font-medium text-purple-900">توفير المال</h4>
                      <ul className="space-y-1 text-sm text-purple-800">
                        <li>• دفع مبالغ إضافية عند الإمكان</li>
                        <li>• إعادة تمويل بمعدل أقل</li>
                        <li>• تجنب تأخير الأقساط</li>
                        <li>• مراجعة شروط التأمين سنوياً</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات مهمة */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                  <ExclamationTriangleIcon className="mx-auto mb-2 h-8 w-8 text-red-600" />
                  <h4 className="mb-1 font-semibold text-red-900">تجنب</h4>
                  <p className="text-sm text-red-800">تأخير الأقساط أو التخلف عن السداد</p>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                  <CalendarDaysIcon className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
                  <h4 className="mb-1 font-semibold text-yellow-900">خطط</h4>
                  <p className="text-sm text-yellow-800">لطوارئ مالية قد تؤثر على السداد</p>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <ShieldCheckIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <h4 className="mb-1 font-semibold text-green-900">احم</h4>
                  <p className="text-sm text-green-800">استثمارك بتأمين شامل مناسب</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FinancingCalculatorPage;
