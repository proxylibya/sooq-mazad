-- فهارس الأداء لقاعدة البيانات - محسنة للزيارات العالية
-- Performance indexes for high traffic optimization

-- فهارس جدول السيارات (cars)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_status_created ON cars(status, "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand_model ON cars(brand, model);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_range ON cars(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_year ON cars(year DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_location ON cars(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_seller_status ON cars("sellerId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_condition ON cars(condition);

-- فهارس جدول المزادات (auctions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_start ON auctions(status, "startTime");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_end_time ON auctions("endTime");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_featured ON auctions(featured, "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_seller ON auctions("sellerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_current_price ON auctions("currentPrice" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_car_status ON auctions("carId", status);

-- فهارس جدول المزايدات (bids)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_amount ON bids("auctionId", amount DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_car_amount ON bids("carId", amount DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_bidder_created ON bids("bidderId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_created_at ON bids("createdAt" DESC);

-- فهارس جدول المستخدمين (users)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_type ON users("accountType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users("createdAt" DESC);

-- فهارس جدول الرسائل (messages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_created ON messages("senderId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver_created ON messages("receiverId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_type ON messages(type);

-- فهارس جدول خدمات النقل (TransportService)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_service_area ON "TransportService"("serviceArea");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_truck_type ON "TransportService"("truckType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_capacity ON "TransportService"(capacity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_price ON "TransportService"("pricePerKm");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_user ON "TransportService"("userId");

-- فهارس جدول ملفات النقل (transport_profiles)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_available ON transport_profiles("isAvailable");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_verified ON transport_profiles(verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_service_area ON transport_profiles("serviceArea");

-- فهارس جدول رموز التحقق (verification_codes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_codes_phone_type ON verification_codes(phone, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_codes_expires ON verification_codes("expiresAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_codes_used ON verification_codes(used);

-- فهارس مركبة للاستعلامات المعقدة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_search_composite ON cars(status, brand, model, year, price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_active_composite ON auctions(status, "startTime", "endTime", featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_composite ON bids("auctionId", "createdAt" DESC, amount DESC);

-- فهرس البحث النصي الكامل للسيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_fulltext_search ON cars USING gin(to_tsvector('arabic', title || ' ' || brand || ' ' || model || ' ' || COALESCE(description, '')));

-- فهرس البحث النصي الكامل للمزادات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_fulltext_search ON auctions USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));

-- فهارس إضافية محسنة للأداء العالي
-- Additional optimized indexes for high performance

-- فهارس إضافية للمستخدمين
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_verified ON users(role, verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_type_verified ON users("accountType", verified);

-- فهارس إضافية للسيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_model ON cars(model);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_mileage ON cars(mileage) WHERE mileage IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_updated_at ON cars("updatedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand_year ON cars(brand, year);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_condition ON cars(price, condition);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_location_status ON cars(location, status);

-- فهارس للبحث المتقدم في السيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_range_low ON cars(price) WHERE price BETWEEN 0 AND 50000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_range_mid ON cars(price) WHERE price BETWEEN 50000 AND 150000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_range_high ON cars(price) WHERE price > 150000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_year_recent ON cars(year) WHERE year >= 2020;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_year_old ON cars(year) WHERE year < 2010;

-- فهارس إضافية للمزادات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_car_id ON auctions("carId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_start_time ON auctions("startTime");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_starting_price ON auctions("startingPrice");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_reserve_price ON auctions("reservePrice") WHERE "reservePrice" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_created_at ON auctions("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_updated_at ON auctions("updatedAt");

-- فهارس للمزادات النشطة والمنتهية
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_active ON auctions(status, "endTime") WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_ended ON auctions(status, "endTime") WHERE status = 'ENDED';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_upcoming ON auctions(status, "startTime") WHERE status = 'UPCOMING';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_featured_active ON auctions(featured, status, "startTime") WHERE featured = true AND status = 'ACTIVE';

-- فهارس إضافية للمزايدات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_car_id ON bids("carId") WHERE "carId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_id ON bids("auctionId") WHERE "auctionId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_bidder_id ON bids("bidderId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_amount ON bids(amount);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_bidder ON bids("auctionId", "bidderId") WHERE "auctionId" IS NOT NULL;

-- فهارس للمزايدات الأعلى
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_highest_auction ON bids("auctionId", amount DESC, "createdAt" DESC) WHERE "auctionId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_highest_car ON bids("carId", amount DESC, "createdAt" DESC) WHERE "carId" IS NOT NULL;

-- فهارس جدول المحافظ
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_id ON wallets("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_balance ON wallets(balance);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_currency ON wallets(currency);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_balance_currency ON wallets(balance, currency);

-- فهارس للمحافظ حسب الرصيد
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_high_balance ON wallets(balance) WHERE balance > 10000;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_low_balance ON wallets(balance) WHERE balance < 1000;

-- فهارس إضافية للرسائل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver_id ON messages("receiverId") WHERE "receiverId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_receiver ON messages("senderId", "receiverId") WHERE "receiverId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_type_created_at ON messages(type, "createdAt" DESC);

-- فهارس رموز التحقق تم حذفها مع إزالة نظام SMS

-- فهارس إضافية لملفات النقل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_user_id ON transport_profiles("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_truck_number ON transport_profiles("truckNumber");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_license_code ON transport_profiles("licenseCode");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_truck_type ON transport_profiles("truckType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_capacity ON transport_profiles(capacity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_price_per_km ON transport_profiles("pricePerKm") WHERE "pricePerKm" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_created_at ON transport_profiles("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_updated_at ON transport_profiles("updatedAt");

-- فهارس مركبة محسنة لملفات النقل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_type_capacity ON transport_profiles("truckType", capacity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_area_price ON transport_profiles("serviceArea", "pricePerKm") WHERE "pricePerKm" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_profiles_available_verified_area ON transport_profiles("isAvailable", verified, "serviceArea");

-- فهارس إضافية لخدمات النقل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_created_at ON "TransportService"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_updated_at ON "TransportService"("updatedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_commission ON "TransportService"(commission);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_area_type ON "TransportService"("serviceArea", "truckType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_type_capacity ON "TransportService"("truckType", capacity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_area_price ON "TransportService"("serviceArea", "pricePerKm") WHERE "pricePerKm" IS NOT NULL;

-- فهارس جدول كلمات المرور
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_passwords_user_id ON user_passwords("userId");

-- فهارس البحث النصي المحسنة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_title_fts ON cars USING gin(to_tsvector('arabic', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_description_fts ON cars USING gin(to_tsvector('arabic', COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_features_fts ON cars USING gin(to_tsvector('arabic', features));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_title_fts ON auctions USING gin(to_tsvector('arabic', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_description_fts ON auctions USING gin(to_tsvector('arabic', COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_title_fts ON "TransportService" USING gin(to_tsvector('arabic', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_description_fts ON "TransportService" USING gin(to_tsvector('arabic', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_services_features_fts ON "TransportService" USING gin(to_tsvector('arabic', features));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name_fts ON users USING gin(to_tsvector('arabic', name));

-- إحصائيات لتحسين الأداء
ANALYZE cars;
ANALYZE auctions;
ANALYZE bids;
ANALYZE users;
ANALYZE messages;
ANALYZE "TransportService";
ANALYZE transport_profiles;
ANALYZE verification_codes;
ANALYZE wallets;
ANALYZE user_passwords;
