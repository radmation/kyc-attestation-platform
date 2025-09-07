import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedGatekeeperPermissions() {
  console.log('🔐 Seeding Gatekeeper Permissions and Roles...');

  // ========================================
  // GATEKEEPER PERMISSIONS
  // ========================================

  const gatekeeperPermissions = [
    // Global pause/unpause (platform admin only)
    {
      name: 'gatekeeper:pause_global',
      description: 'Pause the entire gatekeeper system (emergency maintenance)',
      action: 'pause',
      resource: 'gatekeeper.global',
    },
    {
      name: 'gatekeeper:unpause_global',
      description: 'Unpause the entire gatekeeper system',
      action: 'unpause',
      resource: 'gatekeeper.global',
    },
    
    // Client pause/unpause (regulatory admin)
    {
      name: 'gatekeeper:pause_client',
      description: 'Pause all gatekeeper operations for a specific client',
      action: 'pause',
      resource: 'gatekeeper.client',
    },
    {
      name: 'gatekeeper:unpause_client',
      description: 'Unpause all gatekeeper operations for a specific client',
      action: 'unpause',
      resource: 'gatekeeper.client',
    },
    {
      name: 'gatekeeper:pause_wallet_direct',
      description: 'Pause gatekeeper operations for specific wallet (direct regulatory action)',
      action: 'pause',
      resource: 'gatekeeper.wallet.direct',
    },
    {
      name: 'gatekeeper:unpause_wallet_direct',
      description: 'Unpause gatekeeper operations for specific wallet (direct regulatory action)',
      action: 'unpause',
      resource: 'gatekeeper.wallet.direct',
    },
    
    // Client-scoped wallet operations
    {
      name: 'gatekeeper:pause_wallet_scoped',
      description: 'Pause gatekeeper operations for wallet within client scope',
      action: 'pause',
      resource: 'gatekeeper.wallet.scoped',
    },
    {
      name: 'gatekeeper:unpause_wallet_scoped',
      description: 'Unpause gatekeeper operations for wallet within client scope',
      action: 'unpause',
      resource: 'gatekeeper.wallet.scoped',
    },

    // Blacklisting permissions - Global level (Platform/Regulatory admins only)
    {
      name: 'gatekeeper:add_to_blacklist_global',
      description: 'Add addresses to the global compliance blacklist (sanctions/regulatory)',
      action: 'create',
      resource: 'gatekeeper.blacklist.global',
    },
    {
      name: 'gatekeeper:remove_from_blacklist_global',
      description: 'Remove addresses from the global compliance blacklist',
      action: 'delete',
      resource: 'gatekeeper.blacklist.global',
    },
    {
      name: 'gatekeeper:view_blacklist_global',
      description: 'View globally blacklisted addresses and blacklist status',
      action: 'read',
      resource: 'gatekeeper.blacklist.global',
    },

    // Blacklisting permissions - Client-scoped level (Client admins for their company only)
    {
      name: 'gatekeeper:add_to_blacklist_scoped',
      description: 'Add addresses to client-scoped blacklist (company internal)',
      action: 'create',
      resource: 'gatekeeper.blacklist.scoped',
    },
    {
      name: 'gatekeeper:remove_from_blacklist_scoped',
      description: 'Remove addresses from client-scoped blacklist',
      action: 'delete',
      resource: 'gatekeeper.blacklist.scoped',
    },
    {
      name: 'gatekeeper:view_blacklist_scoped',
      description: 'View client-scoped blacklisted addresses',
      action: 'read',
      resource: 'gatekeeper.blacklist.scoped',
    },
    
    // Read permissions
    {
      name: 'gatekeeper:view_pause_state',
      description: 'View current pause state of gatekeeper components',
      action: 'read',
      resource: 'gatekeeper.state',
    },
    {
      name: 'gatekeeper:view_compliance_global',
      description: 'View global compliance check results and statistics',
      action: 'read',
      resource: 'gatekeeper.compliance.global',
    },
    {
      name: 'gatekeeper:view_compliance_client',
      description: 'View compliance check results within client scope',
      action: 'read',
      resource: 'gatekeeper.compliance.client',
    },

    // Administrative permissions
    {
      name: 'gatekeeper:manage_permissions',
      description: 'Manage gatekeeper permissions and roles',
      action: 'manage',
      resource: 'gatekeeper.permissions',
    },
  ];

  // Create permissions
  for (const permission of gatekeeperPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }

  console.log(`✅ Created ${gatekeeperPermissions.length} gatekeeper permissions`);

  // ========================================
  // PLATFORM-LEVEL ROLES (Global)
  // ========================================

  const platformRoles = [
    // Platform Administrator - Full access including emergency controls
    {
      name: 'Platform Administrator',
      description: 'Full platform access with all administrative permissions',
      isGlobal: true,
      permissions: [
        // Full gatekeeper access
        'gatekeeper:pause_global',
        'gatekeeper:unpause_global',
        'gatekeeper:pause_client',
        'gatekeeper:unpause_client',
        'gatekeeper:pause_wallet_direct',
        'gatekeeper:unpause_wallet_direct',
        'gatekeeper:pause_wallet_scoped',
        'gatekeeper:unpause_wallet_scoped',
        'gatekeeper:add_to_blacklist_global',
        'gatekeeper:remove_from_blacklist_global',
        'gatekeeper:view_blacklist_global',
        'gatekeeper:add_to_blacklist_scoped',
        'gatekeeper:remove_from_blacklist_scoped',
        'gatekeeper:view_blacklist_scoped',
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_global',
        'gatekeeper:view_compliance_client',
        'gatekeeper:manage_permissions',
        // ... other platform permissions would go here
      ],
    },
    {
      name: 'REGULATORY_ADMIN',
      description: 'Regulatory authorities with enforcement powers',
      isGlobal: true,
      permissions: [
        // Regulatory enforcement
        'gatekeeper:pause_client',
        'gatekeeper:unpause_client', 
        'gatekeeper:pause_wallet_direct',
        'gatekeeper:unpause_wallet_direct',
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_global',
      ],
    },
    {
      name: 'TREASURY_AGENT',
      description: 'Treasury/sanctions enforcement agents',
      isGlobal: true,
      permissions: [
        // Wallet-level enforcement only
        'gatekeeper:pause_wallet_direct',
        'gatekeeper:unpause_wallet_direct',
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_global',
      ],
    },
    {
      name: 'COURT_ORDER_EXECUTOR',
      description: 'Law enforcement with court order authority',
      isGlobal: true,
      permissions: [
        // Direct wallet control for court orders
        'gatekeeper:pause_wallet_direct',
        'gatekeeper:unpause_wallet_direct',
        'gatekeeper:view_pause_state',
      ],
    },
    {
      name: 'COMPLIANCE_AUDITOR',
      description: 'Auditors with read-only compliance access',
      isGlobal: true,
      permissions: [
        // Read-only access
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_global',
      ],
    },
  ];

  // Create platform roles
  for (const roleData of platformRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        isGlobal: roleData.isGlobal,
        clientId: null,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        isGlobal: roleData.isGlobal,
        clientId: null,
      },
    });

    // Connect permissions to role
    for (const permissionName of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: { id: permission.id },
            },
          },
        });
      }
    }
  }

  console.log(`✅ Created ${platformRoles.length} platform-level roles`);

  // ========================================
  // CLIENT-SCOPED ROLE TEMPLATES
  // ========================================

  const clientRoleTemplates = [
    {
      name: 'CLIENT_ADMIN_ENHANCED', 
      description: 'Client administrators with gatekeeper controls',
      isGlobal: false,
      permissions: [
        // Client business operations
        'gatekeeper:pause_wallet_scoped',
        'gatekeeper:unpause_wallet_scoped',
        'gatekeeper:add_to_blacklist_scoped',
        'gatekeeper:remove_from_blacklist_scoped',
        'gatekeeper:view_blacklist_scoped',
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_client',
      ],
    },
    {
      name: 'CLIENT_COMPLIANCE_OFFICER',
      description: 'Client compliance officers with monitoring access',
      isGlobal: false,
      permissions: [
        // Compliance monitoring only
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_client',
      ],
    },
    {
      name: 'CLIENT_SECURITY_MANAGER',
      description: 'Client security managers with wallet control',
      isGlobal: false,
      permissions: [
        // Security operations
        'gatekeeper:pause_wallet_scoped',
        'gatekeeper:unpause_wallet_scoped',
        'gatekeeper:add_to_blacklist_scoped',
        'gatekeeper:remove_from_blacklist_scoped',
        'gatekeeper:view_blacklist_scoped',
        'gatekeeper:view_pause_state',
        'gatekeeper:view_compliance_client',
      ],
    },
  ];

  // Note: Client-scoped roles will be created when clients are onboarded
  // This creates the templates that can be instantiated per client
  for (const template of clientRoleTemplates) {
    const role = await prisma.role.upsert({
      where: { name: template.name + '_TEMPLATE' },
      update: {
        description: template.description + ' (Template)',
        isGlobal: false,
        clientId: null, // Template has no specific client
      },
      create: {
        name: template.name + '_TEMPLATE',
        description: template.description + ' (Template)',
        isGlobal: false,
        clientId: null,
      },
    });

    // Connect permissions to template
    for (const permissionName of template.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: { id: permission.id },
            },
          },
        });
      }
    }
  }

  console.log(`✅ Created ${clientRoleTemplates.length} client role templates`);

  // ========================================
  // SUMMARY
  // ========================================

  const totalPermissions = await prisma.permission.count({
    where: { name: { startsWith: 'gatekeeper:' } },
  });

  const totalRoles = await prisma.role.count({
    where: { 
      OR: [
        { name: { in: platformRoles.map(r => r.name) } },
        { name: { endsWith: '_TEMPLATE' } },
      ],
    },
  });

  console.log('\n🎯 Gatekeeper Authorization System Summary:');
  console.log(`📊 Permissions: ${totalPermissions}`);
  console.log(`👥 Roles: ${totalRoles}`);
  console.log('🔐 Authorization Model: Permission-based with client scoping');
  console.log('✅ Gatekeeper permissions and roles seeded successfully!\n');
}

// Helper function to create client-specific roles
export async function createClientGatekeeperRoles(clientId: string, clientName: string) {
  console.log(`🏢 Creating gatekeeper roles for client: ${clientName} (${clientId})`);

  const clientRoles = [
    {
      name: `CLIENT_ADMIN_${clientId.toUpperCase()}`,
      templateName: 'CLIENT_ADMIN_ENHANCED_TEMPLATE',
      description: `${clientName} Administrator with gatekeeper controls`,
    },
    {
      name: `CLIENT_COMPLIANCE_${clientId.toUpperCase()}`,
      templateName: 'CLIENT_COMPLIANCE_OFFICER_TEMPLATE', 
      description: `${clientName} Compliance Officer`,
    },
    {
      name: `CLIENT_SECURITY_${clientId.toUpperCase()}`,
      templateName: 'CLIENT_SECURITY_MANAGER_TEMPLATE',
      description: `${clientName} Security Manager`,
    },
  ];

  for (const roleData of clientRoles) {
    // Get template role with permissions
    const template = await prisma.role.findUnique({
      where: { name: roleData.templateName },
      include: { permissions: true },
    });

    if (!template) {
      console.error(`❌ Template role not found: ${roleData.templateName}`);
      continue;
    }

    // Create client-specific role
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        clientId: clientId,
        isGlobal: false,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        clientId: clientId,
        isGlobal: false,
      },
    });

    // Copy permissions from template
    for (const permission of template.permissions) {
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });
    }
  }

  console.log(`✅ Created ${clientRoles.length} gatekeeper roles for ${clientName}`);
}

// Run seeding if called directly
if (require.main === module) {
  seedGatekeeperPermissions()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error('Error seeding gatekeeper permissions:', error);
      prisma.$disconnect();
      process.exit(1);
    });
} 