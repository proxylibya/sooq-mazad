import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import PaperAirplaneIcon from '@heroicons/react/24/outline/PaperAirplaneIcon';
import { OpensooqNavbar } from '../components/common';

const SupportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const supportCategories = [
    {
      id: 'wallet',
      title: 'مشاكل المحفظة',
      description: 'مشاكل الإيداع والرصيد',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      color: 'blue',
    },
    {
      id: 'account',
      title: 'مشاكل الحساب',
      description: 'تسجيل الدخول والتحقق',
      icon: <QuestionMarkCircleIcon className="h-6 w-6" />,
      color: 'green',
    },
    {
      id: 'technical',
      title: 'مشاكل تقنية',
      description: 'أخطاء الموقع والتطبيق',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      color: 'red',
    },
    {
      id: 'general',
      title: 'استفسارات عامة',
      description: 'أسئلة حول الخدمات',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      color: 'purple',
    },
  ];

  const faqItems = [
    {
      question: 'كيف يمكنني إيداع الأموال في محفظتي؟',
      answer:
        'يمكنك إيداع الأموال عبر عدة طرق: كروت ليبيانا ومدار، البنوك المحلية، البطاقات الائتمانية، أو العملات الرقمية. اذهب إلى صفحة المحفظة واختر طريقة الإيداع المناسبة.',
    },
    {
      question: 'كم يستغرق وقت معالجة الإيداع؟',
      answer:
        'أوقات المعالجة تختلف حسب طريقة الدفع: كروت الهاتف (فوري)، البنوك المحلية (1-3 أيام عمل)، البطاقات الائتمانية (فوري إلى 24 ساعة).',
    },

    {
      question: 'كيف يمكنني تأمين حسابي؟',
      answer:
        'ننصح بتفعيل المصادقة الثنائية، استخدام كلمة مرور قوية، وعدم مشاركة بيانات الدخول مع أي شخص. يمكنك إدارة إعدادات الأمان من صفحة إعدادات المحفظة.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال الرسالة
    setTimeout(() => {
      setLoading(false);
      alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
      setSelectedCategory('');
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>الدعم الفني - مزاد السيارات</title>
        <meta name="description" content="احصل على المساعدة والدعم الفني لجميع استفساراتك" />
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* رأس الصفحة */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">الدعم الفني</h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              نحن هنا لمساعدتك! اختر طريقة التواصل المناسبة أو ابحث في الأسئلة الشائعة
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* العمود الأيسر - طرق التواصل */}
            <div className="space-y-6">
              {/* طرق التواصل السريع */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">تواصل معنا</h2>

                <div className="space-y-4">
                  <a
                    href="tel:+218912345678"
                    className="group flex items-center gap-4 rounded-xl bg-green-50 p-4 transition-colors hover:bg-green-100"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 group-hover:bg-green-200">
                      <PhoneIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">اتصل بنا</h3>
                      <p className="text-sm text-green-700">+218 91 234 5678</p>
                    </div>
                  </a>

                  <a
                    href="mailto:support@auction-cars.ly"
                    className="group flex items-center gap-4 rounded-xl bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">راسلنا</h3>
                      <p className="text-sm text-blue-700">support@auction-cars.ly</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 rounded-xl bg-yellow-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900">ساعات العمل</h3>
                      <p className="text-sm text-yellow-700">الأحد - الخميس: 9ص - 6م</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* حالة الخدمة */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-gray-900">حالة الخدمة</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">المحفظة الإلكترونية</span>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">تعمل بشكل طبيعي</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">المزادات</span>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">تعمل بشكل طبيعي</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">المدفوعات</span>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">تعمل بشكل طبيعي</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* العمود الأوسط - نموذج التواصل */}
            <div className="space-y-6 lg:col-span-2">
              {/* فئات المساعدة */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">كيف يمكننا مساعدتك؟</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {supportCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-xl border-2 p-4 text-right transition-all ${
                        selectedCategory === category.id
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`h-12 w-12 bg-${category.color}-100 mb-3 flex items-center justify-center rounded-xl`}
                      >
                        <div className={`text-${category.color}-600`}>{category.icon}</div>
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* نموذج التواصل */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">أرسل رسالة</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      موضوع الرسالة
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">الأولوية</label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      تفاصيل المشكلة أو الاستفسار
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5" />
                        إرسال الرسالة
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* الأسئلة الشائعة */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">الأسئلة الشائعة</h2>

                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <details key={index} className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                        <h3 className="font-semibold text-gray-900">{item.question}</h3>
                        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-4 leading-relaxed text-gray-700">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;
