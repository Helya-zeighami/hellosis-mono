import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { ApprovalStatus, GroupRole, MatchStatus, MessageStatus, PrismaClient, ReportStatus, UserRole } from '../../generated/prisma/client.js';
import { main as seedCities } from './cities.seed.js';
import { main as seedInterests } from './interests.seed.js';

const COUNT = 100;
const DAY = 86_400_000;
const now = new Date();
const firstNames = ['سارا', 'نازنین', 'مهسا', 'نیلوفر', 'هلیا', 'نگار', 'پریسا', 'ترانه', 'رها', 'بهار', 'یاسمن', 'آوا', 'مریم', 'غزل', 'شیما', 'الناز', 'سمیرا', 'روژین', 'آناهیتا', 'ستاره'];
const lastNames = ['احمدی', 'محمدی', 'رضایی', 'کریمی', 'مرادی', 'حسینی', 'کاظمی', 'جعفری', 'نوری', 'صادقی', 'فرهادی', 'شریفی', 'بهرامی', 'رستمی', 'اکبری', 'موسوی', 'طاهری', 'امینی', 'زارعی', 'قاسمی'];
const groupThemes = ['کتاب‌خوان‌های', 'پیاده‌روی صبحگاهی', 'دوستان قهوه', 'عکاسان شهری', 'یوگا و آرامش', 'برنامه‌نویسان', 'سفرهای آخر هفته', 'آشپزی سالم', 'سینما دوستان', 'هنر و طراحی'];
const eventThemes = ['دورهمی کتاب و قهوه', 'پیاده‌روی دوستانه', 'کارگاه عکاسی موبایل', 'جلسه یوگا در پارک', 'شب بازی‌های رومیزی', 'کارگاه سفالگری', 'گفتگوی فیلم و سینما', 'صبحانه و شبکه‌سازی', 'کلاس آشپزی سالم', 'گردش موزه'];
const placeKinds = ['کافه', 'کتاب‌فروشی', 'گالری', 'پارک', 'رستوران', 'فضای کار اشتراکی', 'باشگاه', 'خانه فرهنگ', 'شیرینی‌فروشی', 'باغ موزه'];
const adjectives = ['آرام', 'روشن', 'دوستانه', 'سبز', 'دنج', 'خلاق', 'دلنشین', 'آفتابی', 'رنگین', 'مهربان'];
const bios = ['عاشق کتاب، قهوه و گفت‌وگوهای صمیمی. همیشه آماده‌ی آشنایی با آدم‌های تازه‌ام.', 'طراح محصول و علاقه‌مند به هنر، طبیعت و تجربه‌های تازه.', 'آخر هفته‌ها کوه می‌روم، عکاسی می‌کنم و جاهای تازه شهر را پیدا می‌کنم.', 'برنامه‌نویس، دوستدار موسیقی و دنبال یک جمع امن و پرانرژی.', 'به یادگیری زبان، سفر و ساختن دوستی‌های واقعی علاقه دارم.'];
const directMessages = ['سلام! دیدم علایق مشترک زیادی داریم 😊', 'برای برنامه آخر هفته آماده‌ای؟', 'این کافه‌ای که معرفی کردی خیلی خوب بود.', 'من هم کتاب جدید را شروع کردم، خیلی جذابه!', 'عکس‌های دورهمی را برات می‌فرستم.', 'چه ساعتی برای دیدار مناسب‌تره؟', 'ممنون از پیشنهاد خوبت 🌷', 'حتماً، پس هماهنگ شدیم!'];
const extraInterests = ['معماری', 'طراحی محصول', 'طراحی داخلی', 'خوشنویسی', 'سفالگری', 'نجوم', 'اقتصاد', 'کارآفرینی', 'مد و استایل', 'مراقبت پوست', 'محیط زیست', 'فعالیت داوطلبانه', 'تئاتر', 'موسیقی سنتی', 'پیانو', 'گیتار', 'صنایع دستی', 'گل‌آرایی', 'کوهنوردی', 'طبیعت‌گردی', 'تنیس', 'بسکتبال', 'والیبال', 'اسکیت', 'شطرنج', 'پازل', 'طراحی بازی', 'هوش مصنوعی', 'تحلیل داده', 'مدیریت محصول', 'کسب‌وکار', 'سرمایه‌گذاری', 'تغذیه سالم', 'سلامت روان', 'مراقبه', 'مادر و کودک', 'آموزش', 'زبان فرانسه', 'زبان آلمانی', 'زبان اسپانیایی', 'داستان کوتاه', 'رمان', 'ادبیات کلاسیک', 'کتاب صوتی', 'مستند', 'انیمیشن', 'پرنده‌نگری', 'نجات حیوانات', 'دکوراسیون', 'مینیمالیسم'];

const pick = <T>(items: T[], index: number) => items[index % items.length];
const daysAgo = (days: number, minutes = 0) => new Date(now.getTime() - days * DAY + minutes * 60_000);
const daysFromNow = (days: number, hours = 0) => new Date(now.getTime() + days * DAY + hours * 3_600_000);

async function main() {
  await seedCities();
  await seedInterests();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }) });

  try {
    await prisma.interest.createMany({ data: extraInterests.map((name) => ({ name })), skipDuplicates: true });
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' }, take: 30 });
    const interests = await prisma.interest.findMany({ orderBy: { name: 'asc' } });
    if (!cities.length || !interests.length) throw new Error('Cities and interests must be seeded first');

    const users = await Promise.all(Array.from({ length: COUNT }, (_, index) => prisma.user.create({
      data: {
        phoneNumber: `+98912${String(index + 1).padStart(7, '0')}`,
        isVerified: true,
        role: index === 0 ? UserRole.ADMIN : UserRole.USER,
        createdAt: daysAgo(COUNT - index),
        profile: { create: { firstName: pick(firstNames, index), lastName: pick(lastNames, index * 3 + 2), bio: pick(bios, index), avatarUrl: `https://i.pravatar.cc/400?img=${(index % 70) + 1}`, birthDate: new Date(1987 + (index % 16), index % 12, (index % 27) + 1), cityId: pick(cities, index).id } },
      },
      include: { profile: true },
    })));

    await prisma.userInterest.createMany({
      data: users.flatMap((user, userIndex) => Array.from({ length: 6 }, (_, offset) => ({ profileId: user.profile!.id, interestId: interests[(userIndex * 7 + offset * 11) % interests.length].id }))),
      skipDuplicates: true,
    });

    const groups = await Promise.all(Array.from({ length: COUNT }, (_, index) => {
      const city = pick(cities, index);
      return prisma.group.create({ data: { creatorId: pick(users, index).id, cityId: city.id, name: `${pick(groupThemes, index)} ${city.name}`, description: `جمعی امن و صمیمی برای علاقه‌مندان ${pick(groupThemes, index)}؛ با برنامه‌های منظم، گفتگوهای دوستانه و تجربه‌های تازه.`, imageUrl: `https://images.unsplash.com/photo-${pick(['1529156069898-49953e39b3ac', '1522202176988-66273c2fd55f', '1511632765486-a01980e01a18', '1531482615713-2afd69097998', '1517245386807-bb43f82c33c4'], index)}?auto=format&fit=crop&w=1200&q=80`, createdAt: daysAgo(90 - (index % 80)) } });
    }));

    await prisma.groupMember.createMany({
      data: groups.flatMap((group, groupIndex) => Array.from({ length: 6 }, (_, offset) => ({ groupId: group.id, userId: users[(groupIndex + offset * 7) % users.length].id, role: offset === 0 ? GroupRole.OWNER : offset === 1 ? GroupRole.ADMIN : GroupRole.MEMBER, joinedAt: daysAgo(60 - offset) }))),
      skipDuplicates: true,
    });
    await prisma.groupMessage.createMany({ data: Array.from({ length: COUNT * 3 }, (_, index) => ({ groupId: groups[index % groups.length].id, senderId: users[(index % groups.length + (index % 6) * 7) % users.length].id, content: pick(['سلام به همه! برای برنامه این هفته هیجان‌زده‌ام.', 'پیشنهاد می‌کنم پنجشنبه عصر دور هم جمع شویم.', 'من شرکت می‌کنم 🌸', 'چه ایده خوبی، ممنون که هماهنگ کردید.', 'لطفاً لوکیشن دقیق را هم بفرستید.'], index), createdAt: daysAgo(index % 20, index * 3) })) });

    const categories = await Promise.all(['کافه و رستوران', 'فرهنگی و هنری', 'طبیعت و فضای باز', 'ورزشی', 'خرید', 'آموزشی', 'سلامت و زیبایی', 'فضای کار'].map((name) => prisma.placeCategory.create({ data: { name } })));
    const admin = users[0];
    const places = await Promise.all(Array.from({ length: COUNT }, (_, index) => {
      const city = pick(cities, index * 3);
      const status = index % 12 === 0 ? ApprovalStatus.PENDING : index % 19 === 0 ? ApprovalStatus.REJECTED : ApprovalStatus.APPROVED;
      return prisma.place.create({ data: { name: `${pick(placeKinds, index)} ${pick(adjectives, index * 3)} ${city.name}`, description: `فضایی ${pick(adjectives, index)} با محیطی تمیز، کارکنان خوش‌برخورد و انتخاب‌های باکیفیت؛ مناسب برای قرارهای دوستانه و وقت‌گذرانی آرام.`, cityId: city.id, address: `${city.name}، بلوار ${pick(['کشاورز', 'ولیعصر', 'فرهنگ', 'بهار', 'آزادی'], index)}، پلاک ${20 + index}`, categoryId: pick(categories, index).id, imageUrl: `https://images.unsplash.com/photo-${pick(['1501339847302-ac426a4a7cbb', '1554118811-1e0d58224f24', '1445116572660-236099ec97a0', '1495474472287-4d71bcdd2085', '1511081692775-05d0f180a065'], index)}?auto=format&fit=crop&w=1200&q=80`, createdById: pick(users, index + 5).id, approvalStatus: status, approvedById: status === ApprovalStatus.APPROVED ? admin.id : undefined, approvedAt: status === ApprovalStatus.APPROVED ? daysAgo(index % 10) : undefined, createdAt: daysAgo(70 - (index % 60)) } });
    }));
    await prisma.review.createMany({ data: Array.from({ length: COUNT * 3 }, (_, index) => ({ placeId: places[index % places.length].id, userId: users[(index * 13 + 9) % users.length].id, rating: 3 + (index % 3), comment: pick(['فضای خیلی دلنشین و آرامی داشت.', 'برخورد کارکنان عالی بود، دوباره می‌آیم.', 'کیفیت خوب و دسترسی راحت.', 'برای قرار دوستانه پیشنهادش می‌کنم.', 'محیط تمیز و حس خوبی داشت.'], index), createdAt: daysAgo(index % 45) })) });

    const events = await Promise.all(Array.from({ length: COUNT }, (_, index) => {
      const status = index % 11 === 0 ? ApprovalStatus.PENDING : index % 23 === 0 ? ApprovalStatus.REJECTED : ApprovalStatus.APPROVED;
      const startTime = daysFromNow((index % 60) + 1, 9 + (index % 10));
      return prisma.event.create({ data: { creatorId: pick(users, index + 12).id, cityId: pick(cities, index * 5).id, title: `${pick(eventThemes, index)} #${index + 1}`, description: 'یک تجربه دوستانه و باکیفیت برای آشنایی، یادگیری و ساختن خاطره‌های تازه. ظرفیت محدود است و برنامه در محیطی امن برگزار می‌شود.', startTime, endTime: new Date(startTime.getTime() + (2 + (index % 3)) * 3_600_000), approvalStatus: status, approvedById: status === ApprovalStatus.APPROVED ? admin.id : undefined, approvedAt: status === ApprovalStatus.APPROVED ? daysAgo(index % 7) : undefined, createdAt: daysAgo(index % 50) } });
    }));
    await prisma.eventLike.createMany({ data: Array.from({ length: COUNT * 4 }, (_, index) => ({ eventId: events[index % events.length].id, userId: users[(index * 17 + 3) % users.length].id, createdAt: daysAgo(index % 20) })), skipDuplicates: true });
    await prisma.eventDislike.createMany({ data: Array.from({ length: COUNT }, (_, index) => ({ eventId: events[index % events.length].id, userId: users[(index * 19 + 8) % users.length].id, createdAt: daysAgo(index % 20) })), skipDuplicates: true });
    await prisma.eventComment.createMany({ data: Array.from({ length: COUNT * 2 }, (_, index) => ({ eventId: events[index % events.length].id, userId: users[(index * 11 + 4) % users.length].id, content: pick(['من حتماً شرکت می‌کنم!', 'برای همراه آوردن دوست هم امکان ثبت‌نام هست؟', 'برنامه خیلی جذابی به نظر می‌رسد.', 'ممنون از برگزاری این رویداد 🌷', 'ساعت و آدرس برای من عالی است.'], index), createdAt: daysAgo(index % 15) })) });

    const conversations = await Promise.all(Array.from({ length: COUNT }, (_, index) => prisma.conversation.create({ data: { userOneId: users[index].id, userTwoId: users[(index + 23) % users.length].id, lastMessageAt: daysAgo(index % 14, index * 7), createdAt: daysAgo(40 - (index % 30)) } })));
    await prisma.message.createMany({ data: conversations.flatMap((conversation, conversationIndex) => Array.from({ length: 8 }, (_, messageIndex) => ({ conversationId: conversation.id, senderId: messageIndex % 2 === 0 ? conversation.userOneId : conversation.userTwoId, content: pick(directMessages, conversationIndex + messageIndex), status: MessageStatus.READ, createdAt: daysAgo(conversationIndex % 14, messageIndex * 8) }))) });

    await prisma.match.createMany({ data: Array.from({ length: COUNT }, (_, index) => ({ senderId: users[index].id, recipientId: users[(index + 31) % users.length].id, status: index % 4 === 0 ? MatchStatus.PENDING : index % 9 === 0 ? MatchStatus.REJECTED : MatchStatus.ACCEPTED, respondedAt: index % 4 === 0 ? undefined : daysAgo(index % 20), createdAt: daysAgo(30 - (index % 25)) })), skipDuplicates: true });
    await prisma.notification.createMany({ data: Array.from({ length: COUNT * 2 }, (_, index) => ({ userId: users[index % users.length].id, type: pick(['MATCH_REQUEST', 'NEW_MESSAGE', 'EVENT_REMINDER', 'GROUP_UPDATE'], index), message: pick(['یک درخواست دوستی جدید دارید.', 'یک پیام تازه برای شما ارسال شده است.', 'رویداد شما فردا برگزار می‌شود.', 'در گروه مورد علاقه شما خبر تازه‌ای هست.'], index), isRead: index % 3 !== 0, createdAt: daysAgo(index % 20) })) });
    await prisma.report.createMany({ data: Array.from({ length: COUNT }, (_, index) => ({ reporterId: users[index].id, reportedUserId: users[(index + 41) % users.length].id, reason: pick(['رفتار نامناسب در گفتگو', 'ارسال محتوای تبلیغاتی', 'اطلاعات پروفایل نادرست', 'پیام‌های تکراری و مزاحم'], index), status: pick([ReportStatus.PENDING, ReportStatus.REVIEWED, ReportStatus.RESOLVED, ReportStatus.REJECTED], index), createdAt: daysAgo(index % 60) })) });

    const summary = { users: await prisma.user.count(), profiles: await prisma.profile.count(), interests: await prisma.interest.count(), groups: await prisma.group.count(), groupMembers: await prisma.groupMember.count(), groupMessages: await prisma.groupMessage.count(), events: await prisma.event.count(), eventComments: await prisma.eventComment.count(), places: await prisma.place.count(), reviews: await prisma.review.count(), conversations: await prisma.conversation.count(), messages: await prisma.message.count(), matches: await prisma.match.count(), notifications: await prisma.notification.count(), reports: await prisma.report.count() };
    console.log('Hellosis demo data seeded:', summary);
    console.log('Admin demo phone: +989120000001 (request a development OTP to sign in)');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
