import Toast from '@/app/_components/Toast'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const SuccessToast: Story = {
  args: {
    message: 'Success',
    toastType: 'success'
  }
}

export const WarningToast: Story = {
  args: {
    message: 'Warning',
    toastType: 'warning'
  }
}

export const ErrorToast: Story = {
  args: {
    message: 'Error',
    toastType: 'error'
  }
}
