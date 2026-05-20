import {
  PrismaClient,
  Role,
  Permission,
  TicketStatus,
  TicketPriority,
  ProductType,
  DeliveryMethod,
  ReviewStatus,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Wiping existing database records...');

  // Deactivate foreign key constraint checks during truncation to prevent relation errors
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const tables = [
    'TicketMessage',
    'SupportTicket',
    'Review',
    'CartItem',
    'Cart',
    'Wishlist',
    'OrderItem',
    'OrderStatusHistory',
    'PaymentInstallment',
    'Payment',
    'Shipment',
    'ShippingRate',
    'ShippingZone',
    'Order',
    'UserRolePermission',
    'RefreshToken',
    'Session',
    'Address',
    'User',
    'ProductMedia',
    'ProductFeature',
    'ProductVariant',
    'Product',
    'Category',
    'Faq',
    'FaqCategory',
    'Banner',
    'Coupon',
    'Notification',
    'AuditLog',
    'Setting',
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  - Truncated table: ${table}`);
    } catch (err) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
        console.log(`  - Deleted records from table: ${table}`);
      } catch (innerErr) {
        console.error(`  ⚠️ Failed to wipe table ${table}:`, innerErr);
      }
    }
  }

  // Reactivate foreign key checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('✅ Wipe completed successfully.\n');

  console.log('👥 Creating users (SUPER_ADMIN, ADMIN, SUPPORT, CUSTOMERS)...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  // 1. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@wavi.store',
      phone: '966500000001',
      passwordHash,
      firstName: 'محمد',
      lastName: 'المالكي',
      role: Role.SUPER_ADMIN,
    },
  });

  // 2. Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@wavi.store',
      phone: '966500000002',
      passwordHash,
      firstName: 'أحمد',
      lastName: 'العتيبي',
      role: Role.ADMIN,
    },
  });

  // 3. Support Agent
  const support = await prisma.user.create({
    data: {
      email: 'support@wavi.store',
      phone: '966500000003',
      passwordHash,
      firstName: 'سارة',
      lastName: 'الغامدي',
      role: Role.SUPPORT,
    },
  });

  // 4. Customer 1
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@gmail.com',
      phone: '966500000004',
      passwordHash,
      firstName: 'خالد',
      lastName: 'الشمري',
      role: Role.CUSTOMER,
    },
  });

  // 5. Customer 2
  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@gmail.com',
      phone: '966500000005',
      passwordHash,
      firstName: 'عبدالله',
      lastName: 'الدوسري',
      role: Role.CUSTOMER,
    },
  });

  console.log('🔐 Seeding Permissions & Role mapping matrix...');
  
  // Seed all permissions for Super Admin
  const allPermissions = Object.values(Permission);
  await prisma.userRolePermission.createMany({
    data: allPermissions.map((perm) => ({
      userId: superAdmin.id,
      permission: perm,
    })),
  });

  // Seed standard permissions for Admin
  const adminPermissions = [
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_VIEW,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.COUPON_CREATE,
    Permission.COUPON_UPDATE,
    Permission.COUPON_DELETE,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.SETTINGS_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.SUPPORT_MANAGE,
  ];
  await prisma.userRolePermission.createMany({
    data: adminPermissions.map((perm) => ({
      userId: admin.id,
      permission: perm,
    })),
  });

  // Seed support agent permissions
  const supportPermissions = [
    Permission.PRODUCT_VIEW,
    Permission.ORDER_VIEW,
    Permission.USER_VIEW,
    Permission.SUPPORT_MANAGE,
  ];
  await prisma.userRolePermission.createMany({
    data: supportPermissions.map((perm) => ({
      userId: support.id,
      permission: perm,
    })),
  });

  console.log('📌 Seeding FAQ Categories & Questions...');
  
  // FAQ Category 1: الاشتراكات
  const faqCat1 = await prisma.faqCategory.create({
    data: {
      nameAr: 'الاشتراكات والتشغيل',
      nameEn: 'Subscriptions & Playback',
      sortOrder: 0,
    },
  });

  await prisma.faq.createMany({
    data: [
      {
        categoryId: faqCat1.id,
        questionAr: 'كيف أحصل على كود تفعيل IPTV بعد الشراء؟',
        answerAr: 'سوف يصلك كود التفعيل فوراً عبر رسالة نصية وواتساب، ويمكنك أيضاً إيجاده في صفحة تفاصيل الطلب بحسابك.',
        sortOrder: 0,
      },
      {
        categoryId: faqCat1.id,
        questionAr: 'هل يدعم سيرفر Smarters التشغيل على الشاشات الذكية؟',
        answerAr: 'نعم، يدعم التشغيل على جميع شاشات سامسونج، إل جي، وشاشات أندرويد الذكية عبر تطبيق Smarters Pro الرسمي.',
        sortOrder: 1,
      },
    ],
  });

  // FAQ Category 2: الدفع والاستلام
  const faqCat2 = await prisma.faqCategory.create({
    data: {
      nameAr: 'الدفع والأمان',
      nameEn: 'Payments & Security',
      sortOrder: 1,
    },
  });

  await prisma.faq.createMany({
    data: [
      {
        categoryId: faqCat2.id,
        questionAr: 'ما هي طرق الدفع المتاحة في المتجر؟',
        answerAr: 'نوفر الدفع الآمن عبر مدى، فيزا، أبل باي، بالإضافة إلى إمكانية تقسيط المشتريات بدون فوائد عبر تابي وتمارا.',
        sortOrder: 0,
      },
      {
        categoryId: faqCat2.id,
        questionAr: 'هل هناك فترة ضمان على الاشتراكات الرقمية؟',
        answerAr: 'نعم، جميع اشتراكاتنا مضمونة طوال فترة الاشتراك بالكامل، ونوفر تعويض أو حل للمشكلات بشكل فوري.',
        sortOrder: 1,
      },
    ],
  });

  console.log('🖼️ Seeding Hero Slide Banners...');
  await prisma.banner.createMany({
    data: [
      {
        titleAr: 'أقوى اشتراكات IPTV بجودة 4K وبدون تقطيع',
        titleEn: 'Best IPTV Subscriptions in 4K',
        imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
        placement: 'hero',
        sortOrder: 0,
      },
      {
        titleAr: 'أكواد تفعيل وتوصيل فوري وتلقائي',
        titleEn: 'Instant & Automatic Delivery Codes',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        placement: 'hero',
        sortOrder: 1,
      },
      {
        titleAr: 'قسط مشترياتك مع تابي وتمارا بدون رسوم خفية',
        titleEn: 'Split Your Payments via Tabby & Tamara',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        placement: 'hero',
        sortOrder: 2,
      },
    ],
  });

  console.log('📁 Seeding Categories...');
  
  // 1. Smarters IPTV
  const catSmarters = await prisma.category.create({
    data: {
      nameAr: 'سمارترز - smarters',
      nameEn: 'Smarters IPTV',
      slug: 'smarters-iptv',
      isFeatured: true,
      descriptionAr: 'اشتراكات سيرفر سمارترز الفاخرة بجودة فائقة السرعة والاستقرار.',
    },
  });

  // 2. Universe IPTV
  const catUniverse = await prisma.category.create({
    data: {
      nameAr: 'يونيفرس - Universe',
      nameEn: 'Universe IPTV',
      slug: 'universe-iptv',
      isFeatured: true,
      descriptionAr: 'سيرفر يونيفرس العالمي لمشاهدة كافة قنوات العالم والمباريات مباشرة دون تقطيع.',
    },
  });

  // 3. Falcon Pro IPTV
  const catFalconPro = await prisma.category.create({
    data: {
      nameAr: 'فالكون برو - FALCON PRO',
      nameEn: 'Falcon Pro IPTV',
      slug: 'falcon-pro-iptv',
      isFeatured: true,
      descriptionAr: 'باقات فالكون برو الممتازة والشهيرة بثباتها الفائق ودعمها الكامل للأجهزة الذكية.',
    },
  });

  // 4. Xiaomi TV Box 2026
  const catXiaomi = await prisma.category.create({
    data: {
      nameAr: 'Xiaomi TV Box 2026',
      nameEn: 'Xiaomi TV Box 2026',
      slug: 'xiaomi-tv-box',
      isFeatured: true,
      descriptionAr: 'أجهزة شاومي تي في بوكس وشاومي تي في ستيك لتشغيل كافة الاشتراكات وسيرفرات التلفاز الذكي.',
    },
  });

  console.log('🛍️ Seeding Products & Complex Multi-variants...');

  // --- Category 1: Smarters IPTV Products ---
  // Product 1
  const prodSmartersPlay = await prisma.product.create({
    data: {
      categoryId: catSmarters.id,
      sku: 'PROD-SMARTERS-PLAY-VIP',
      nameAr: 'اشتراك سمارترز بلاي VIP',
      nameEn: 'Smarters Play VIP Subscription',
      slug: 'smarters-play-vip-subscription',
      shortDescAr: 'الباقة الأكثر طلباً لسيرفر سمارترز مع دعم تشغيل شاشتين في نفس الوقت.',
      descriptionAr: 'اشتراك سمارترز بلاي في اي بي يمنحك وصولاً كاملاً لأكثر من 10,000 قناة رياضية وترفيهية بجودة Full HD و 4K، مع دعم كامل للغة العربية ودعم الترجمة والتشغيل عبر شاشتين مختلفتين بشكل متزامن.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 120.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodSmartersPlay.id,
        sku: 'SMARTERS-PLAY-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 45.0,
        compareAtPrice: 60.0,
        durationMonths: 3,
        devicesCount: 2,
      },
      {
        productId: prodSmartersPlay.id,
        sku: 'SMARTERS-PLAY-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 75.0,
        compareAtPrice: 100.0,
        durationMonths: 6,
        devicesCount: 2,
      },
      {
        productId: prodSmartersPlay.id,
        sku: 'SMARTERS-PLAY-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 120.0,
        compareAtPrice: 160.0,
        durationMonths: 12,
        devicesCount: 2,
      },
    ],
  });

  // Product 2
  const prodSmartersLite = await prisma.product.create({
    data: {
      categoryId: catSmarters.id,
      sku: 'PROD-SMARTERS-LITE',
      nameAr: 'سيرفر سمارترز لايت الأوفر',
      nameEn: 'Smarters Lite Server',
      slug: 'smarters-lite-server',
      shortDescAr: 'الباقة الاقتصادية الممتازة لأصحاب الاتصالات المتوسطة والقنوات الأساسية.',
      descriptionAr: 'سيرفر سمارترز لايت مصمم خصيصاً ليعمل بأعلى كفاءة على السرعات المتوسطة وبدون استهلاك للبيانات، يضم القنوات الرياضية والترفيهية الأساسية بدقة HD.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 85.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodSmartersLite.id,
        sku: 'SMARTERS-LITE-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 30.0,
        compareAtPrice: 45.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodSmartersLite.id,
        sku: 'SMARTERS-LITE-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 50.0,
        compareAtPrice: 70.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodSmartersLite.id,
        sku: 'SMARTERS-LITE-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 85.0,
        compareAtPrice: 120.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // Product 3
  const prodSmartersFamily = await prisma.product.create({
    data: {
      categoryId: catSmarters.id,
      sku: 'PROD-SMARTERS-FAMILY',
      nameAr: 'اشتراك سمارترز العائلي (شاشتين)',
      nameEn: 'Smarters Family Subscription',
      slug: 'smarters-family-subscription',
      shortDescAr: 'باقة سمارترز الفاخرة المخصصة للعائلات وتدعم تشغيل جهازين في نفس الوقت.',
      descriptionAr: 'استمتع بمشاهدة كافة قنوات التلفزيون ومبارياتك المفضلة وأحدث المسلسلات مع عائلتك على شاشتين مختلفتين بنفس الوقت وبدقة فائقة تصل إلى 4K UHD وبأعلى درجات الاستقرار.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 180.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodSmartersFamily.id,
        sku: 'SMARTERS-FAMILY-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 65.0,
        compareAtPrice: 90.0,
        durationMonths: 3,
        devicesCount: 2,
      },
      {
        productId: prodSmartersFamily.id,
        sku: 'SMARTERS-FAMILY-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 110.0,
        compareAtPrice: 150.0,
        durationMonths: 6,
        devicesCount: 2,
      },
      {
        productId: prodSmartersFamily.id,
        sku: 'SMARTERS-FAMILY-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 180.0,
        compareAtPrice: 250.0,
        durationMonths: 12,
        devicesCount: 2,
      },
    ],
  });

  // --- Category 2: Universe IPTV Products ---
  // Product 1
  const prodUniverseUltra = await prisma.product.create({
    data: {
      categoryId: catUniverse.id,
      sku: 'PROD-UNIVERSE-ULTRA',
      nameAr: 'اشتراك يونيفرس الترا 4K',
      nameEn: 'Universe Ultra 4K Subscription',
      slug: 'universe-ultra-4k-subscription',
      shortDescAr: 'السيرفر المتميز بأضخم مكتبة أفلام ومسلسلات مع جودة بث فائقة الاستقرار.',
      descriptionAr: 'يمنحك سيرفر يونيفرس الترا 4K وصولاً لأكبر مكتبة ترفيهية متكاملة تضم أكثر من 12,000 فيلم ومسلسل يتم تحديثها يومياً، بالإضافة للقنوات التلفزيونية الرياضية والترفيهية المشفرة بثبات أسطوري.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 145.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodUniverseUltra.id,
        sku: 'UNIVERSE-ULTRA-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 50.0,
        compareAtPrice: 75.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodUniverseUltra.id,
        sku: 'UNIVERSE-ULTRA-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 90.0,
        compareAtPrice: 130.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodUniverseUltra.id,
        sku: 'UNIVERSE-ULTRA-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 145.0,
        compareAtPrice: 200.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // Product 2
  const prodUniversePlus = await prisma.product.create({
    data: {
      categoryId: catUniverse.id,
      sku: 'PROD-UNIVERSE-PLUS',
      nameAr: 'سيرفر يونيفرس بلس الماسي',
      nameEn: 'Universe Plus Diamond Server',
      slug: 'universe-plus-diamond-server',
      shortDescAr: 'اشتراك الباقة الخاصة عالية الجودة مع قنوات حصرية ومحتوى VIP فائق الثبات.',
      descriptionAr: 'سيرفر يونيفرس بلس الماسي هو الخيار الأمثل لعشاق المحتوى الرياضي المباشر والأفلام بجودة UHD 4K، يتميز بنظام سيرفرات احتياطية مضاعفة تمنع أي تقطيع أثناء الضغط العالي.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 165.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodUniversePlus.id,
        sku: 'UNIVERSE-PLUS-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 60.0,
        compareAtPrice: 85.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodUniversePlus.id,
        sku: 'UNIVERSE-PLUS-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 100.0,
        compareAtPrice: 140.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodUniversePlus.id,
        sku: 'UNIVERSE-PLUS-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 165.0,
        compareAtPrice: 230.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // Product 3
  const prodUniverseMini = await prisma.product.create({
    data: {
      categoryId: catUniverse.id,
      sku: 'PROD-UNIVERSE-MINI',
      nameAr: 'اشتراك يونيفرس ميني للأجهزة الذكية',
      nameEn: 'Universe Mini for Smart Devices',
      slug: 'universe-mini-smart-devices',
      shortDescAr: 'الباقة المخصصة للهواتف المحمولة والأجهزة اللوحية والستريمر بجودة HD سريعة التنقل.',
      descriptionAr: 'اشتراك يونيفرس ميني يوفر واجهة تصفح خفيفة وسريعة ومثالية للعمل على أجهزة الجوال والألواح الذكية وأبل تي في، يحتوي على قائمة قنوات منسقة بعناية لسهولة التصفح والبحث.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 99.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodUniverseMini.id,
        sku: 'UNIVERSE-MINI-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 35.0,
        compareAtPrice: 50.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodUniverseMini.id,
        sku: 'UNIVERSE-MINI-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 60.0,
        compareAtPrice: 85.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodUniverseMini.id,
        sku: 'UNIVERSE-MINI-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 99.0,
        compareAtPrice: 140.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // --- Category 3: Falcon Pro IPTV Products ---
  // Product 1
  const prodFalconProPrem = await prisma.product.create({
    data: {
      categoryId: catFalconPro.id,
      sku: 'PROD-FALCON-PRO-PREM',
      nameAr: 'اشتراك فالكون برو الممتاز',
      nameEn: 'Falcon Pro Premium Subscription',
      slug: 'falcon-pro-premium-subscription',
      shortDescAr: 'الباقة الأقوى والأعلى ثباتاً في الوطن العربي مع مكتبة محتوى ضخمة جداً.',
      descriptionAr: 'سيرفر فالكون برو الممتاز هو الخيار الأول في منطقة الخليج العربي لمشاهدة المباريات الحية والبطولات الرياضية بجودة فائقة وبث ثابت تماماً لا يتأثر بالضغط العالي.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 150.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodFalconProPrem.id,
        sku: 'FALCON-PREM-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 55.0,
        compareAtPrice: 80.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodFalconProPrem.id,
        sku: 'FALCON-PREM-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 95.0,
        compareAtPrice: 140.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodFalconProPrem.id,
        sku: 'FALCON-PREM-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 150.0,
        compareAtPrice: 220.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // Product 2
  const prodFalconProGold = await prisma.product.create({
    data: {
      categoryId: catFalconPro.id,
      sku: 'PROD-FALCON-PRO-GOLD',
      nameAr: 'سيرفر فالكون برو جولد سبورت',
      nameEn: 'Falcon Pro Gold Sport Server',
      slug: 'falcon-pro-gold-sport-server',
      shortDescAr: 'سيرفر مخصص لعشاق الرياضة والسرعة العالية مع قنوات مكررة بمختلف الجودات.',
      descriptionAr: 'سيرفر فالكون برو جولد سبورت يمنحك وصولاً للقنوات الرياضية العالمية مكررة بأربع جودات مختلفة (Low, SD, HD, 4K) لتضمن متابعة كاملة ومريحة مهما كانت سرعة اتصالك بالإنترنت.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 180.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodFalconProGold.id,
        sku: 'FALCON-GOLD-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 65.0,
        compareAtPrice: 95.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodFalconProGold.id,
        sku: 'FALCON-GOLD-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 115.0,
        compareAtPrice: 160.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodFalconProGold.id,
        sku: 'FALCON-GOLD-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 180.0,
        compareAtPrice: 260.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // Product 3
  const prodFalconProMobile = await prisma.product.create({
    data: {
      categoryId: catFalconPro.id,
      sku: 'PROD-FALCON-PRO-MOBILE',
      nameAr: 'اشتراك فالكون برو للأجهزة المحمولة',
      nameEn: 'Falcon Pro for Mobile Devices',
      slug: 'falcon-pro-mobile-devices',
      shortDescAr: 'باقة مخصصة لتشغيل اشتراك فالكون بجودة HD ممتازة على أجهزة الجوال والأيباد.',
      descriptionAr: 'اشتراك فالكون برو المخفض المخصص للأجهزة المحمولة وأجهزة التابلت وأبل كيدز، يتميز بسهولة التشغيل عبر تطبيق Falcon Player الرسمي وخفته الفائقة في عرض القنوات المباشرة.',
      productType: ProductType.SUBSCRIPTION,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      basePrice: 89.0,
      isDigital: true,
      requiresInfo: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodFalconProMobile.id,
        sku: 'FALCON-MOBILE-3M',
        nameAr: 'اشتراك 3 شهور',
        nameEn: '3 Months Subscription',
        price: 30.0,
        compareAtPrice: 45.0,
        durationMonths: 3,
        devicesCount: 1,
      },
      {
        productId: prodFalconProMobile.id,
        sku: 'FALCON-MOBILE-6M',
        nameAr: 'اشتراك 6 شهور',
        nameEn: '6 Months Subscription',
        price: 55.0,
        compareAtPrice: 80.0,
        durationMonths: 6,
        devicesCount: 1,
      },
      {
        productId: prodFalconProMobile.id,
        sku: 'FALCON-MOBILE-12M',
        nameAr: 'اشتراك سنة كاملة',
        nameEn: '12 Months Subscription',
        price: 89.0,
        compareAtPrice: 130.0,
        durationMonths: 12,
        devicesCount: 1,
      },
    ],
  });

  // --- Category 4: Xiaomi TV Box 2026 Products ---
  // Product 1
  const prodXiaomiBoxS = await prisma.product.create({
    data: {
      categoryId: catXiaomi.id,
      sku: 'PROD-XIAOMI-BOXS-2G',
      nameAr: 'جهاز Xiaomi TV Box S (الجيل الثاني)',
      nameEn: 'Xiaomi TV Box S 2nd Gen',
      slug: 'xiaomi-tv-box-s-2nd-gen',
      shortDescAr: 'جهاز تشغيل وسائط التلفزيون الذكي 4K Ultra HD يدعم جوجل تي في وبلوتوث 5.2.',
      descriptionAr: 'جهاز شاومي تي في بوكس اس الجيل الثاني يحول شاشتك العادية إلى شاشة ذكية بنظام Google TV الرسمي، يدعم دقة 4K فائقة الوضوح ومساعد جوجل الصوتي بالإضافة إلى تكنولوجيا Dolby Vision و Dolby Atmos لتجربة صوتية وسينمائية غامرة.',
      productType: ProductType.PHYSICAL,
      deliveryMethod: DeliveryMethod.SHIPPING,
      basePrice: 220.0,
      isDigital: false,
      trackInventory: true,
      stockQty: 80,
      lowStockThreshold: 10,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodXiaomiBoxS.id,
        sku: 'XIAOMI-BOXS-HW',
        nameAr: 'الجهاز بدون تفعيل',
        nameEn: 'Hardware Only (No Subscription)',
        price: 220.0,
        compareAtPrice: 280.0,
      },
      {
        productId: prodXiaomiBoxS.id,
        sku: 'XIAOMI-BOXS-FALCON',
        nameAr: 'الجهاز + اشتراك سنة فالكون برو',
        nameEn: 'Box + 1 Year Falcon Pro',
        price: 320.0,
        compareAtPrice: 450.0,
      },
      {
        productId: prodXiaomiBoxS.id,
        sku: 'XIAOMI-BOXS-UNIVERSE',
        nameAr: 'الجهاز + اشتراك سنة يونيفرس الترا',
        nameEn: 'Box + 1 Year Universe Ultra',
        price: 310.0,
        compareAtPrice: 430.0,
      },
    ],
  });

  // Product 2
  const prodXiaomiStick = await prisma.product.create({
    data: {
      categoryId: catXiaomi.id,
      sku: 'PROD-XIAOMI-STICK-4K',
      nameAr: 'جهاز Xiaomi TV Stick 4K',
      nameEn: 'Xiaomi TV Stick 4K',
      slug: 'xiaomi-tv-stick-4k',
      shortDescAr: 'ستيك ذكي محمول 4K يتم توصيله بمدخل HDMI مباشرة لتحويل أي شاشة إلى تلفزيون أندرويد ذكي.',
      descriptionAr: 'شاومي تي في ستيك 4K يتميز بحجمه الصغير وسهولة نقله، يدعم نظام Android TV official ويوفر وصولاً سريعاً لنتفلكس، يوتيوب، وكافة تطبيقات السيرفرات والاشتراكات الرقمية.',
      productType: ProductType.PHYSICAL,
      deliveryMethod: DeliveryMethod.SHIPPING,
      basePrice: 180.0,
      isDigital: false,
      trackInventory: true,
      stockQty: 100,
      lowStockThreshold: 15,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodXiaomiStick.id,
        sku: 'XIAOMI-STICK-HW',
        nameAr: 'الجهاز بدون تفعيل',
        nameEn: 'Hardware Only (No Subscription)',
        price: 180.0,
        compareAtPrice: 240.0,
      },
      {
        productId: prodXiaomiStick.id,
        sku: 'XIAOMI-STICK-FALCON',
        nameAr: 'الجهاز + اشتراك سنة فالكون برو',
        nameEn: 'Stick + 1 Year Falcon Pro',
        price: 280.0,
        compareAtPrice: 400.0,
      },
      {
        productId: prodXiaomiStick.id,
        sku: 'XIAOMI-STICK-SMARTERS',
        nameAr: 'الجهاز + اشتراك سنة سمارترز VIP',
        nameEn: 'Stick + 1 Year Smarters VIP',
        price: 260.0,
        compareAtPrice: 370.0,
      },
    ],
  });

  // Product 3
  const prodXiaomiBoxPro = await prisma.product.create({
    data: {
      categoryId: catXiaomi.id,
      sku: 'PROD-XIAOMI-BOXPRO-2026',
      nameAr: 'جهاز Xiaomi TV Box 2026 Pro',
      nameEn: 'Xiaomi TV Box 2026 Pro',
      slug: 'xiaomi-tv-box-2026-pro',
      shortDescAr: 'النسخة الاحترافية الفائقة بمواصفات مطورة ومعالج أسرع وذاكرة عشوائية أكبر لتجربة ألعاب وتصفح خارقة.',
      descriptionAr: 'شاومي تي في بوكس برو 2026 هو الخيار الأقوى على الإطلاق لألعاب الستريم وبث المحتوى المباشر بجودة 8K، مجهز بمنفذ إيثرنت مدمج، ذاكرة 4GB RAM ومساحة تخزينية 32GB لتنصيب مئات التطبيقات الرقمية والترفيهية دون أي تباطؤ.',
      productType: ProductType.PHYSICAL,
      deliveryMethod: DeliveryMethod.SHIPPING,
      basePrice: 350.0,
      isDigital: false,
      trackInventory: true,
      stockQty: 40,
      lowStockThreshold: 5,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: prodXiaomiBoxPro.id,
        sku: 'XIAOMI-BOXPRO-HW',
        nameAr: 'الجهاز بدون تفعيل',
        nameEn: 'Hardware Only (No Subscription)',
        price: 350.0,
        compareAtPrice: 450.0,
      },
      {
        productId: prodXiaomiBoxPro.id,
        sku: 'XIAOMI-BOXPRO-FALCON-2Y',
        nameAr: 'الجهاز + اشتراك سنتين فالكون برو',
        nameEn: 'Box + 2 Years Falcon Pro',
        price: 500.0,
        compareAtPrice: 690.0,
      },
    ],
  });

  console.log('🎫 Seeding Promotional Checkout Coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WAVI2026',
        type: 'PERCENTAGE',
        value: 15.0,
        maxUses: 100,
        maxUsesPerUser: 1,
        minOrderAmount: 100.0,
      },
      {
        code: 'FIRST10',
        type: 'FIXED_AMOUNT',
        value: 10.0,
        maxUses: 500,
        maxUsesPerUser: 1,
        minOrderAmount: 50.0,
      },
    ],
  });

  console.log('⭐️ Seeding Product Reviews (Approved)...');
  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        productId: prodFalconProPrem.id,
        rating: 5,
        titleAr: 'سيرفر رائع وسرعة في التفعيل',
        bodyAr: 'تم تفعيل الخدمة عبر الواتساب في أقل من 5 دقائق، السيرفر ثابت بدون أي تقطيع في القنوات الرياضية.',
        status: ReviewStatus.APPROVED,
      },
      {
        userId: customer2.id,
        productId: prodSmartersPlay.id,
        rating: 4,
        titleAr: 'توصيل كود التفعيل تلقائي وممتاز',
        bodyAr: 'وصلني كود تفعيل سمارترز فوراً بعد إتمام الدفع بالصفحة ورسالة الجوال، ممتاز وسهل جداً.',
        status: ReviewStatus.APPROVED,
      },
    ],
  });


  console.log('🎟️ Seeding Support Tickets and Conversation Logs...');
  
  // Ticket 1: Falcon activation help query
  const ticket1 = await prisma.supportTicket.create({
    data: {
      ticketNo: 'TICKET-00001',
      customerId: customer1.id,
      subject: 'مشكلة في تفعيل اشتراك فالكون',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      channel: 'web',
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        senderId: customer1.id,
        body: 'السلام عليكم، لقد قمت بشراء اشتراك فالكون 12 شهر ولم يصلني كود التفعيل التلقائي حتى الآن.',
        isInternal: false,
      },
      {
        ticketId: ticket1.id,
        senderId: support.id,
        body: 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك يا فندم. لقد قمنا بالتحقق ووجدنا خطأ بسيط برقم الواتساب المسجل، تم تعديل الرقم وإرسال كود التفعيل يدوياً، هل يمكنك التحقق الآن؟',
        isInternal: false,
      },
      {
        ticketId: ticket1.id,
        senderId: support.id,
        body: 'ملاحظة داخلية للدعم: تم الإرسال اليدوي وحل المشكلة بسبب كتابة كود الدولة 966 بشكل مكرر.',
        isInternal: true,
      },
    ],
  });

  // Ticket 2: General inquiries
  const ticket2 = await prisma.supportTicket.create({
    data: {
      ticketNo: 'TICKET-00002',
      customerId: customer2.id,
      subject: 'الاستفسار عن توافق طابعة الفواتير',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      agentId: support.id,
      channel: 'web',
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket2.id,
        senderId: customer2.id,
        body: 'مرحباً، هل طابعة الفواتير الحرارية XP-80 متوافقة مع تطبيق كاشير هود المعتمد في السعودية؟',
        isInternal: false,
      },
    ],
  });

  console.log('\n🚀 Database Seeding complete! WAVI STORE is fully primed for development and testing.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding script execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
