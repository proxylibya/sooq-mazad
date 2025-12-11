/**
 * @sooq-mazad/config
 * Shared configuration
 */

export const config = {
    appName: 'سوق مزاد',
    ports: {
        web: 3021,
        admin: 3022,
        api: 3020,
    },
};

// نظام الترويج الموحد
export * from './promotion';

export default config;
