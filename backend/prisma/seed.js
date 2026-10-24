const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const nigerianStates = [
  { name: 'Abia', code: 'AB' }, { name: 'Adamawa', code: 'AD' },
  { name: 'Akwa Ibom', code: 'AK' }, { name: 'Anambra', code: 'AN' },
  { name: 'Bauchi', code: 'BA' }, { name: 'Bayelsa', code: 'BY' },
  { name: 'Benue', code: 'BE' }, { name: 'Borno', code: 'BO' },
  { name: 'Cross River', code: 'CR' }, { name: 'Delta', code: 'DE' },
  { name: 'Ebonyi', code: 'EB' }, { name: 'Edo', code: 'ED' },
  { name: 'Ekiti', code: 'EK' }, { name: 'Enugu', code: 'EN' },
  { name: 'FCT - Abuja', code: 'FC' }, { name: 'Gombe', code: 'GO' },
  { name: 'Imo', code: 'IM' }, { name: 'Jigawa', code: 'JI' },
  { name: 'Kaduna', code: 'KD' }, { name: 'Kano', code: 'KN' },
  { name: 'Katsina', code: 'KT' }, { name: 'Kebbi', code: 'KB' },
  { name: 'Kogi', code: 'KO' }, { name: 'Kwara', code: 'KW' },
  { name: 'Lagos', code: 'LA' }, { name: 'Nasarawa', code: 'NA' },
  { name: 'Niger', code: 'NI' }, { name: 'Ogun', code: 'OG' },
  { name: 'Ondo', code: 'ON' }, { name: 'Osun', code: 'OS' },
  { name: 'Oyo', code: 'OY' }, { name: 'Plateau', code: 'PL' },
  { name: 'Rivers', code: 'RI' }, { name: 'Sokoto', code: 'SO' },
  { name: 'Taraba', code: 'TA' }, { name: 'Yobe', code: 'YO' },
  { name: 'Zamfara', code: 'ZA' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed states
  for (const state of nigerianStates) {
    await prisma.state.upsert({
      where: { code: state.code },
      update: {},
      create: state,
    });
  }
  console.log(`✅ Seeded ${nigerianStates.length} Nigerian states`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@swiftroute.ng' },
    update: {},
    create: {
      email: 'admin@swiftroute.ng',
      phone: '08000000000',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Demo logistics company owner
  const companyOwnerPassword = await bcrypt.hash('Company@12345', 12);
  const companyOwner = await prisma.user.upsert({
    where: { email: 'lagos@swiftdemo.ng' },
    update: {},
    create: {
      email: 'lagos@swiftdemo.ng',
      phone: '08012345678',
      password: companyOwnerPassword,
      role: 'COMPANY',
      firstName: 'Demo',
      lastName: 'Logistics',
      isVerified: true,
    },
  });

  const company = await prisma.company.upsert({
    where: { ownerId: companyOwner.id },
    update: {},
    create: {
      ownerId: companyOwner.id,
      name: 'SwiftMove Lagos',
      description: 'Fast and reliable deliveries across Lagos State',
      state: 'Lagos',
      city: 'Lagos Island',
      address: '15 Marina Road, Lagos Island',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Demo company created:', company.name);

  console.log('\n🎉 Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:   admin@swiftroute.ng / Admin@12345');
  console.log('Company Login: lagos@swiftdemo.ng  / Company@12345');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
