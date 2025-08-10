import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create permissions for different resources
  const permissions = [
    // User management permissions
    { name: 'user:create', description: 'Create new users', resource: 'user', action: 'create' },
    { name: 'user:read', description: 'Read user information', resource: 'user', action: 'read' },
    { name: 'user:update', description: 'Update user information', resource: 'user', action: 'update' },
    { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
    
    // Profile management permissions
    { name: 'profile:create', description: 'Create new profiles', resource: 'profile', action: 'create' },
    { name: 'profile:read', description: 'Read profile information', resource: 'profile', action: 'read' },
    { name: 'profile:update', description: 'Update profile information', resource: 'profile', action: 'update' },
    { name: 'profile:delete', description: 'Delete profiles', resource: 'profile', action: 'delete' },
    
    // KYC verification permissions
    { name: 'kyc:verify', description: 'Verify KYC information', resource: 'kyc', action: 'verify' },
    { name: 'kyc:approve', description: 'Approve KYC verification', resource: 'kyc', action: 'approve' },
    { name: 'kyc:reject', description: 'Reject KYC verification', resource: 'kyc', action: 'reject' },
    { name: 'kyc:read', description: 'Read KYC information', resource: 'kyc', action: 'read' },
    
    // Attestation permissions
    { name: 'attestation:create', description: 'Create attestations', resource: 'attestation', action: 'create' },
    { name: 'attestation:read', description: 'Read attestation information', resource: 'attestation', action: 'read' },
    { name: 'attestation:approve', description: 'Approve attestations', resource: 'attestation', action: 'approve' },
    { name: 'attestation:revoke', description: 'Revoke attestations', resource: 'attestation', action: 'revoke' },
    
    // Client management permissions
    { name: 'client:create', description: 'Create new clients', resource: 'client', action: 'create' },
    { name: 'client:read', description: 'Read client information', resource: 'client', action: 'read' },
    { name: 'client:update', description: 'Update client information', resource: 'client', action: 'update' },
    { name: 'client:delete', description: 'Delete clients', resource: 'client', action: 'delete' },
    
    // Monitoring permissions
    { name: 'monitoring:read', description: 'Read monitoring data', resource: 'monitoring', action: 'read' },
    { name: 'monitoring:flag', description: 'Flag suspicious activity', resource: 'monitoring', action: 'flag' },
    { name: 'monitoring:block', description: 'Block transactions', resource: 'monitoring', action: 'block' },
    
    // System administration permissions
    { name: 'system:admin', description: 'Full system access', resource: 'system', action: 'admin' },
    { name: 'system:config', description: 'Configure system settings', resource: 'system', action: 'config' },
  ]

  console.log('📝 Creating permissions...')
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    })
  }

  // Create global roles
  console.log('👑 Creating global roles...')
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Platform super administrator with full access',
      isGlobal: true,
      clientId: null,
    },
  })

  const platformAdminRole = await prisma.role.upsert({
    where: { name: 'platform_admin' },
    update: {},
    create: {
      name: 'platform_admin',
      description: 'Platform administrator with broad access',
      isGlobal: true,
      clientId: null,
    },
  })

  // Assign all permissions to super admin
  const allPermissions = await prisma.permission.findMany()
  await prisma.role.update({
    where: { id: superAdminRole.id },
    data: {
      permissions: {
        connect: allPermissions.map(p => ({ id: p.id })),
      },
    },
  })

  // Assign most permissions to platform admin (excluding system:admin)
  const platformAdminPermissions = allPermissions.filter(p => p.name !== 'system:admin')
  await prisma.role.update({
    where: { id: platformAdminRole.id },
    data: {
      permissions: {
        connect: platformAdminPermissions.map(p => ({ id: p.id })),
      },
    },
  })

  // Create client-scoped roles (these will be created when clients are created)
  console.log('🏢 Client-scoped roles will be created dynamically when clients are added')

  console.log('✅ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 