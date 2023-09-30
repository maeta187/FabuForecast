import RootLayout from '@/app/layout'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/RootLayout',
  component: RootLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof RootLayout>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedIn: Story = { args: { children: `LoggedIn` } }

// export const LoggedOut: Story = {}
