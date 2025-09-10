// Prisma Database Seeding Script
// Bangladesh dev style - practical demo data for development

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Create demo users
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
          username: 'john_affiliate',
          email: 'john@example.com',
          phone: '+1234567890',
          firstName: 'John',
          lastName: 'Smith',
          passwordHash: hashedPassword,
          apiKey: 'api_key_john_123456789',
          tier: 'GOLD',
          totalEarnings: 15420.50,
          totalClicks: 2850,
          totalConversions: 142,
          conversionRate: 4.98,
          emailVerified: true,
          phoneVerified: true
        }
      }),
      
      prisma.user.upsert({
        where: { email: 'admin@store.com' },
        update: {},
        create: {
          username: 'admin_user',
          email: 'admin@store.com',
          phone: '+1987654321',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: hashedPassword,
          apiKey: 'admin_key_demo_store_123',
          tier: 'PLATINUM',
          status: 'ACTIVE',
          emailVerified: true,
          phoneVerified: true
        }
      }),
      
      prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
          username: 'sarah_marketer',
          email: 'sarah@example.com',
          phone: '+1555123456',
          firstName: 'Sarah',
          lastName: 'Johnson',
          passwordHash: hashedPassword,
          apiKey: 'api_key_sarah_987654321',
          tier: 'SILVER',
          totalEarnings: 8950.25,
          totalClicks: 1890,
          totalConversions: 89,
          conversionRate: 4.71,
          emailVerified: true
        }
      })
    ]);
    
    console.log('✅ Users created successfully');

    // Create demo products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { sku: 'FASH-001' },
        update: {},
        create: {
          name: 'Premium Fashion Collection',
          description: 'High-quality fashion items for modern lifestyle',
          price: 149.99,
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
          category: 'Fashion',
          vendor: 'Style Store',
          sku: 'FASH-001',
          commissionRate: 15.0,
          commissionType: 'PERCENTAGE',
          stockQuantity: 250,
          totalSales: 89,
          totalRevenue: 13349.11,
          totalCommissionsPaid: 2002.37
        }
      }),
      
      prisma.product.upsert({
        where: { sku: 'TECH-002' },
        update: {},
        create: {
          name: 'Smart Tech Gadgets',
          description: 'Latest technology products and accessories',
          price: 299.99,
          imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147',
          category: 'Technology',
          vendor: 'Tech Hub',
          sku: 'TECH-002',
          commissionRate: 12.0,
          commissionType: 'PERCENTAGE',
          stockQuantity: 180,
          totalSales: 67,
          totalRevenue: 20099.33,
          totalCommissionsPaid: 2411.92
        }
      })
    ]);
    
    console.log('✅ Products created successfully');

    // Create demo affiliate links
    const affiliateLinks = await Promise.all([
      prisma.affiliateLink.upsert({
        where: { shortCode: 'FAS123' },
        update: {},
        create: {
          userId: users[0].id,
          name: 'Fashion Collection',
          description: 'Premium fashion items',
          originalUrl: 'https://store.com/fashion',
          shortCode: 'FAS123',
          shortUrl: 'https://aff.ly/FAS123',
          category: 'Fashion',
          totalClicks: 1250,
          uniqueClicks: 890,
          totalConversions: 45,
          conversionRate: 3.60,
          totalEarnings: 4850.00,
          utmSource: 'affiliate',
          utmMedium: 'link',
          utmCampaign: 'fashion_promo'
        }
      }),
      
      prisma.affiliateLink.upsert({
        where: { shortCode: 'TECH456' },
        update: {},
        create: {
          userId: users[0].id,
          name: 'Tech Gadgets',
          description: 'Latest technology products',
          originalUrl: 'https://store.com/tech',
          shortCode: 'TECH456',
          shortUrl: 'https://aff.ly/TECH456',
          category: 'Technology',
          totalClicks: 890,
          uniqueClicks: 645,
          totalConversions: 32,
          conversionRate: 3.60,
          totalEarnings: 3200.00,
          utmSource: 'affiliate',
          utmMedium: 'link',
          utmCampaign: 'tech_deals'
        }
      }),
      
      prisma.affiliateLink.upsert({
        where: { shortCode: 'HOME789' },
        update: {},
        create: {
          userId: users[2].id,
          name: 'Home & Garden',
          description: 'Home improvement and garden supplies',
          originalUrl: 'https://store.com/home-garden',
          shortCode: 'HOME789',
          shortUrl: 'https://aff.ly/HOME789',
          category: 'Home',
          totalClicks: 567,
          uniqueClicks: 423,
          totalConversions: 28,
          conversionRate: 4.94,
          totalEarnings: 2150.75
        }
      })
    ]);
    
    console.log('✅ Affiliate links created successfully');

    // Create demo commissions
    const commissions = await Promise.all([
      prisma.commission.create({
        data: {
          userId: users[0].id,
          linkId: affiliateLinks[0].id,
          productId: products[0].id,
          commissionType: 'PRODUCT_SALE',
          saleAmount: 149.99,
          commissionRate: 15.0,
          commissionAmount: 22.50,
          userTier: 'GOLD',
          tierMultiplier: 1.15,
          orderId: 'ORD-2024-001',
          customerEmail: 'customer1@example.com',
          customerCountry: 'US',
          referrerSource: 'facebook',
          deviceType: 'mobile',
          browser: 'Chrome',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          saleDate: new Date('2024-01-15'),
          confirmedDate: new Date('2024-01-16'),
          paidDate: new Date('2024-01-20')
        }
      }),
      
      prisma.commission.create({
        data: {
          userId: users[0].id,
          linkId: affiliateLinks[1].id,
          productId: products[1].id,
          commissionType: 'PRODUCT_SALE',
          saleAmount: 299.99,
          commissionRate: 12.0,
          commissionAmount: 36.00,
          userTier: 'GOLD',
          tierMultiplier: 1.15,
          orderId: 'ORD-2024-002',
          customerEmail: 'customer2@example.com',
          customerCountry: 'CA',
          referrerSource: 'google',
          deviceType: 'desktop',
          browser: 'Safari',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          saleDate: new Date('2024-01-18'),
          confirmedDate: new Date('2024-01-19'),
          paidDate: new Date('2024-01-23')
        }
      })
    ]);
    
    console.log('✅ Commissions created successfully');

    // Create demo payment methods
    const paymentMethods = await Promise.all([
      prisma.paymentMethod.create({
        data: {
          userId: users[0].id,
          type: 'PAYPAL',
          provider: 'PayPal',
          name: 'My PayPal Account',
          details: JSON.stringify({
            email: 'john@example.com',
            accountId: 'paypal_account_123'
          }),
          isDefault: true,
          status: 'verified',
          verificationStatus: 'verified'
        }
      }),
      
      prisma.paymentMethod.create({
        data: {
          userId: users[2].id,
          type: 'STRIPE',
          provider: 'Stripe',
          name: 'Bank Account',
          details: JSON.stringify({
            bankName: 'Chase Bank',
            accountLast4: '1234',
            routingNumber: 'xxx-xxx-xxx'
          }),
          isDefault: true,
          status: 'verified',
          verificationStatus: 'verified'
        }
      })
    ]);
    
    console.log('✅ Payment methods created successfully');

    // Create demo user settings
    await Promise.all([
      prisma.userSettings.create({
        data: {
          userId: users[0].id,
          timezone: 'America/New_York',
          language: 'en',
          currency: 'USD',
          monthlyEarningsGoal: 5000.00,
          monthlyClicksGoal: 1000,
          monthlyConversionsGoal: 50,
          minimumPayout: 100.00,
          autoPayoutEnabled: true,
          autoPayoutFrequency: 'monthly',
          defaultPayoutMethodId: paymentMethods[0].id,
          marketingEmails: true,
          twoFactorEnabled: false
        }
      }),
      
      prisma.userSettings.create({
        data: {
          userId: users[2].id,
          timezone: 'America/Los_Angeles',
          language: 'en',
          currency: 'USD',
          monthlyEarningsGoal: 3000.00,
          monthlyClicksGoal: 750,
          monthlyConversionsGoal: 35,
          minimumPayout: 50.00,
          autoPayoutEnabled: false,
          defaultPayoutMethodId: paymentMethods[1].id,
          marketingEmails: true,
          twoFactorEnabled: true,
          twoFactorMethod: 'sms'
        }
      })
    ]);
    
    console.log('✅ User settings created successfully');

    // Create some click tracking data
    const clickData = [];
    for (let i = 0; i < 50; i++) {
      clickData.push({
        linkId: affiliateLinks[Math.floor(Math.random() * affiliateLinks.length)].id,
        userId: users[Math.floor(Math.random() * users.length)].id,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referer: 'https://google.com',
        country: ['US', 'CA', 'UK', 'AU'][Math.floor(Math.random() * 4)],
        city: ['New York', 'Toronto', 'London', 'Sydney'][Math.floor(Math.random() * 4)],
        deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
        os: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
        converted: Math.random() > 0.7,
        clickedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }
    
    await prisma.clickTracking.createMany({
      data: clickData
    });
    
    console.log('✅ Click tracking data created successfully');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDemo accounts created:');
    console.log('1. John Smith (john@example.com) - Gold tier affiliate');
    console.log('2. Admin User (admin@store.com) - Platinum tier admin');
    console.log('3. Sarah Johnson (sarah@example.com) - Silver tier affiliate');
    console.log('\nPassword for all demo accounts: demo123');
    console.log('\nAPI Keys:');
    console.log('- John: api_key_john_123456789');
    console.log('- Admin: admin_key_demo_store_123');
    console.log('- Sarah: api_key_sarah_987654321');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
