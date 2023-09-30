import Sidebar from '@/app/_components/Sidebar'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  // tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedIn: Story = {
  args: {}
}

// export const LoggedOut: Story = {}
