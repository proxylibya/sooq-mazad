// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 🗺️ API الخرائط - تحويل العناوين
 * GET /api/integrations/maps/geocode?address=...
 * POST /api/integrations/maps/geocode (reverse geocoding)
 */

// بيانات المدن الليبية
const LIBYAN_CITIES: Record<string, { lat: number; lng: number; }> = {
    'طرابلس': { lat: 32.8872, lng: 13.1913 },
    'بنغازي': { lat: 32.1194, lng: 20.0868 },
    'مصراتة': { lat: 32.3754, lng: 15.0925 },
    'الزاوية': { lat: 32.7571, lng: 12.7278 },
    'زليتن': { lat: 32.4674, lng: 14.5687 },
    'البيضاء': { lat: 32.7626, lng: 21.7587 },
    'سبها': { lat: 27.0384, lng: 14.4283 },
    'طبرق': { lat: 32.0836, lng: 23.9764 },
    'سرت': { lat: 31.2089, lng: 16.5887 },
    'درنة': { lat: 32.7648, lng: 22.6367 },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === 'GET') {
            // Geocoding: تحويل عنوان إلى إحداثيات
            const { address, city } = req.query;

            if (!address && !city) {
                return res.status(400).json({
                    success: false,
                    error: 'العنوان أو المدينة مطلوبة'
                });
            }

            const searchTerm = (city || address) as string;
            const cityData = LIBYAN_CITIES[searchTerm];

            if (cityData) {
                return res.status(200).json({
                    success: true,
                    location: {
                        lat: cityData.lat,
                        lng: cityData.lng,
                        address: searchTerm,
                        city: searchTerm,
                        country: 'ليبيا'
                    }
                });
            }

            // إذا لم يتم العثور على المدينة، نرجع إحداثيات طرابلس كافتراضي
            return res.status(200).json({
                success: true,
                location: {
                    lat: 32.8872,
                    lng: 13.1913,
                    address: searchTerm,
                    city: 'طرابلس',
                    country: 'ليبيا',
                    note: 'تم استخدام الموقع الافتراضي'
                }
            });

        } else if (req.method === 'POST') {
            // Reverse Geocoding: تحويل إحداثيات إلى عنوان
            const { lat, lng } = req.body;

            if (!lat || !lng) {
                return res.status(400).json({
                    success: false,
                    error: 'الإحداثيات مطلوبة'
                });
            }

            // البحث عن أقرب مدينة
            let closestCity = 'طرابلس';
            let minDistance = Infinity;

            for (const [cityName, coords] of Object.entries(LIBYAN_CITIES)) {
                const distance = Math.sqrt(
                    Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCity = cityName;
                }
            }

            return res.status(200).json({
                success: true,
                location: {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    city: closestCity,
                    country: 'ليبيا'
                }
            });

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error: any) {
        console.error('[Maps API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في معالجة الموقع'
        });
    }
}
