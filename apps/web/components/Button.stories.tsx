import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'نوع الزر',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'حجم الزر',
    },
    disabled: {
      control: 'boolean',
      description: 'تعطيل الزر',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'زر أساسي',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'زر ثانوي',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'زر محدد',
    variant: 'outline',
  },
};

export const Danger: Story = {
  args: {
    children: 'حذف',
    variant: 'danger',
  },
};

export const Disabled: Story = {
  args: {
    children: 'زر معطل',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: 'زر صغير',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'زر كبير',
    size: 'lg',
  },
};
