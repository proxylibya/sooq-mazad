import type { Preview } from '@storybook/react';
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },
  globalTypes: {
    locale: {
      description: 'اللغة',
      defaultValue: 'ar',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ar', title: 'العربية' },
          { value: 'en', title: 'English' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
