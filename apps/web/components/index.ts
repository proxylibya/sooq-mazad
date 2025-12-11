// Features
export * from './features/auctions';
export * from './features/auth';
export * from './features/marketplace';
export * from './features/transport';
export * from './features/wallet';

// Common Components
export * from './common';

// Legacy Components (to be gradually migrated)
export { default as AIAssistant } from './AIAssistant';
export { default as AccountTypeBadge } from './AccountTypeBadge';
export { default as AccountTypeBadgeNavbar } from './AccountTypeBadgeNavbar';
export { default as AuctionNotifications } from './AuctionNotifications';
export { default as AuctionOwnerPanel } from './AuctionOwnerPanel';
export { default as BankLogo } from './BankLogo';
export { default as BodyTypeSelector } from './BodyTypeSelector';
export { default as CallInterface } from './CallInterface';
export { default as CarBrandLogo } from './CarBrandLogo';
export { default as CarBrandSelector } from './CarBrandSelector';
// تم نقل CarComments إلى الأرشيف - يتم استخدام ReviewsAndRatings الموحد
// export { default as CarComments } from './CarComments';
export { default as CarFeaturesDisplay } from './CarFeaturesDisplay';
export { default as CarInfoDisplay } from './CarInfoDisplay';
export { default as ChargingSuccessCard } from './ChargingSuccessCard';
export { default as CityFilteredListings } from './CityFilteredListings';
export { default as CitySearchForm } from './CitySearchForm';
export { default as CountrySelector } from './CountrySelector';
export { default as DateDisplay } from './DateDisplay';
export { default as DateLocationInfo } from './DateLocationInfo';
export { default as DefaultUserAvatar } from './DefaultUserAvatar';
export { default as DepositSecurityAlert } from './DepositSecurityAlert';
export { default as DownloadAppSection } from './DownloadAppSection';
export { default as EnhancedPromotionCard } from './EnhancedPromotionCard';
export { default as EnhancedServiceProviderHTML } from './EnhancedServiceProviderHTML';
export { default as EnhancedTransportFilterHTML } from './EnhancedTransportFilterHTML';
export { default as ErrorMonitor } from './ErrorMonitor';
export { default as FeaturedAddListingSection } from './FeaturedAddListingSection';
export { default as ImageCarousel } from './ImageCarousel';
export { default as ImprovedChatInterface } from './ImprovedChatInterface';
export { default as ImprovedSellerInfoCard } from './ImprovedSellerInfoCard';
export { default as ImprovedUserDropdown } from './ImprovedUserDropdown';
export { default as LinkBankAccountModal } from './LinkBankAccountModal';
export { default as LiveAuction } from './LiveAuction';
export { default as LocalizationErrorBoundary } from './LocalizationErrorBoundary';
export { default as LocalizedContent } from './LocalizedContent';
export { default as LocalizedPrice } from './LocalizedPrice';
export { default as LocationMessage } from './LocationMessage';
export { default as LocationPicker } from './LocationPicker';
export { default as LocationPickerModal } from './LocationPickerModal';
export { default as LocationSelector } from './LocationSelector';
export { default as MobileAuctionControls } from './MobileAuctionControls';
export { default as ModernChatInterface } from './ModernChatInterface';
export { default as Notification } from './Notification';
export { default as NotificationConnectionStatus } from './NotificationConnectionStatus';
export { default as NumberDisplay } from './NumberDisplay';
export { default as OpenSooqCarBrandSelector } from './OpenSooqCarBrandSelector';
export { default as MapFilters } from './maps/MarketplaceMapFilters';
// إزالة الاسم المستعار القديم لمنع استخدام العلامة الممنوعة

export { default as PaymentMethodCard } from './PaymentMethodCard';
export { default as PhoneDisplay } from './PhoneDisplay';
export { default as PhoneInputField } from './PhoneInputField';
export { default as PhoneNumberDisplay } from './PhoneNumberDisplay';
export { default as PortalFix } from './PortalFix';
export { default as PostForm } from './PostForm';
export { default as PremiumCarsStats } from './PremiumCarsStats';
export { default as PriceDisplay } from './PriceDisplay';
export { default as ProfileImageUpload } from './ProfileImageUpload';
export { default as ProgressMonitor } from './ProgressMonitor';
export { default as QRCodeGenerator } from './QRCodeGenerator';
export { default as UnifiedPhoneInput, arabCountries } from './UnifiedPhoneInput';
export type { Country, UnifiedPhoneInputProps } from './UnifiedPhoneInput';
// تم حذف QuickAuctionTest - غير مستخدم
// export { default as QuickAuctionTest } from './QuickAuctionTest';
// تم حذف QuickReview - يتم استخدام ReviewsAndRatings الموحد بدلاً منه
// export { default as QuickReview } from './QuickReview';
export { default as ReportModal } from './ReportModal';
export { default as ReportsCard } from './ReportsCard';
export { default as SafeCarImage } from './SafeCarImage';
export { default as SafeDataRenderer } from './SafeDataRenderer';
export { default as SafeFileUpload } from './SafeFileUpload';
export { default as SafeStorageProvider } from './SafeStorageProvider';
export { default as SafetyTips } from './SafetyTips';
export { default as SaveStatusIndicator } from './SaveStatusIndicator';
export { default as SellerInfoCard } from './SellerInfoCard';
export { default as SellerInfoSimple } from './SellerInfoSimple';
export { default as SellerInfoWrapper } from './SellerInfoWrapper';
export { default as SessionManager } from './SessionManager';
export { default as ShareModal } from './ShareModal';
export { default as ShowroomCard } from './ShowroomCard';
export { default as ShowroomCardGrid } from './ShowroomCardGrid';
export { default as SimpleCityListings } from './SimpleCityListings';
export { default as SimpleYearRange } from './SimpleYearRange';
export { default as SmartAuctionBadge } from './SmartAuctionBadge';
export { default as TruckImagesUpload } from './TruckImagesUpload';
export { default as UniversalAuctionBadge } from './UniversalAuctionBadge';
export { default as UniversalBrandLogo } from './UniversalBrandLogo';
export { default as UniversalBrandSelector } from './UniversalBrandSelector';
export { default as UniversalBrandStats } from './UniversalBrandStats';
export { default as UserAccountIcon } from './UserAccountIcon';
export { default as UserAvatar } from './UserAvatar';
export { default as UserProfileHeader } from './UserProfileHeader';
export { default as VerificationStatus } from './VerificationStatus';
export { default as VoiceRecorder } from './VoiceRecorder';
export { default as WalletLoginPrompt } from './WalletLoginPrompt';
export { default as WesternNumeralsProvider } from './WesternNumeralsProvider';
export { default as YearSelector } from './YearSelector';
// مكونات التقييمات الموحدة
export { default as RatingCard } from './common/RatingCard';
export { default as ReviewSummary } from './common/ReviewSummary';
export { default as ReviewsAndRatings } from './common/ReviewsAndRatings';

