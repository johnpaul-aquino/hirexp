import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed navigation settings for TRAINEE role
  const traineeNavItems = [
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard/trainee',
      isEnabled: true,
      displayOrder: 0,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'assessments',
      label: 'English Assessments',
      href: '/dashboard/trainee/assessments',
      isEnabled: false, // Disabled by default as per requirement
      displayOrder: 1,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'chat',
      label: 'AI Chat',
      href: '/dashboard/trainee/chat',
      isEnabled: true, // Enabled by default
      displayOrder: 2,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'interview',
      label: 'AI Interview',
      href: '/dashboard/trainee/interview',
      isEnabled: false, // Disabled by default
      displayOrder: 3,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'typing',
      label: 'Typing Test',
      href: '/dashboard/trainee/typing',
      isEnabled: false, // Disabled by default
      displayOrder: 4,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'mock-call',
      label: 'Mock Call',
      href: '/dashboard/trainee/mock-call',
      isEnabled: true, // Enabled by default
      displayOrder: 5,
    },
    {
      userRole: UserRole.TRAINEE,
      navigationKey: 'certificate',
      label: 'Certificate',
      href: '/dashboard/trainee/certificate',
      isEnabled: false, // Disabled by default
      displayOrder: 6,
    },
  ]

  console.log('Creating navigation settings for TRAINEE role...')
  for (const item of traineeNavItems) {
    await prisma.navigationSetting.upsert({
      where: {
        userRole_navigationKey: {
          userRole: item.userRole,
          navigationKey: item.navigationKey,
        },
      },
      update: {},
      create: item,
    })
  }

  console.log('Navigation settings created successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
