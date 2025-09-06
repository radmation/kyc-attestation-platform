const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Create a test client
    const client = await prisma.client.upsert({
      where: { id: 'test-client-1' },
      update: {},
      create: {
        id: 'test-client-1',
        name: 'Test Client 1',
        domain: 'test-client-1.com',
        subdomain: 'test1',
        isActive: true,
      },
    });
    
    console.log('Created test client:', client);
    
    // Create test branding
    const branding = await prisma.branding.upsert({
      where: { clientId: 'test-client-1' },
      update: {},
      create: {
        id: 'branding-test-client-1',
        clientId: 'test-client-1',
        primaryColor: '#1e40af',
        secondaryColor: '#64748b',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        surfaceColor: '#f8fafc',
        textColor: '#1e293b',
        borderColor: '#e2e8f0',
        fontFamily: 'Inter',
        borderRadius: '0.5rem',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    });
    
    console.log('Created test branding:', branding);
    
    // Create default client
    const defaultClient = await prisma.client.upsert({
      where: { id: 'default-client' },
      update: {},
      create: {
        id: 'default-client',
        name: 'Default Client',
        domain: 'localhost',
        isActive: true,
      },
    });
    
    console.log('Created default client:', defaultClient);
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 