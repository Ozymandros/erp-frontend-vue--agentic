export interface MenuItem {
  title: string
  icon: string
  to?: string
  children?: MenuItem[]
  requiresAuth?: boolean
}

export const menuConfig: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  {
    title: 'Agents',
    icon: 'mdi-robot',
    children: [
      { title: 'All Agents', icon: 'mdi-format-list-bulleted', to: '/agents' },
      { title: 'Create Agent', icon: 'mdi-plus', to: '/agents/new' },
    ],
  },
  {
    title: 'Sessions',
    icon: 'mdi-forum',
    children: [
      { title: 'All Sessions', icon: 'mdi-format-list-bulleted', to: '/sessions' },
      { title: 'New Chat', icon: 'mdi-chat-plus', to: '/sessions/new' },
    ],
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    to: '/settings',
  },
]

export default menuConfig