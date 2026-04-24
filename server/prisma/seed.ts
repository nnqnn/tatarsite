import { PrismaClient, PlaceCategory, Language } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("Qwerty123!");

  const demoUsers = [
    {
      email: "admin@tatarsite.ru",
      displayName: "Админ ТатарСайт",
      language: Language.RU,
      preferences: [PlaceCategory.CULTURE, PlaceCategory.FOOD, PlaceCategory.EVENTS],
    },
    {
      email: "gulnara@tatarsite.ru",
      displayName: "Гульнара",
      language: Language.RU,
      preferences: [PlaceCategory.CRAFTS, PlaceCategory.CULTURE, PlaceCategory.HISTORY],
    },
    {
      email: "farid@tatarsite.ru",
      displayName: "Фарид",
      language: Language.RU,
      preferences: [PlaceCategory.FOOD, PlaceCategory.NATURE, PlaceCategory.EVENTS],
    },
  ];

  for (const user of demoUsers) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        displayName: user.displayName,
        passwordHash,
        language: user.language,
        onboardingCompletedAt: new Date(),
        preferences: {
          create: user.preferences.map((interestKey) => ({ interestKey })),
        },
      },
      update: {
        displayName: user.displayName,
        language: user.language,
      },
    });

    await prisma.userPreference.deleteMany({ where: { userId: upserted.id } });
    await prisma.userPreference.createMany({
      data: user.preferences.map((interestKey) => ({ userId: upserted.id, interestKey })),
      skipDuplicates: true,
    });
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  if (users.length < 3) {
    throw new Error("Не удалось создать тестовых пользователей.");
  }

  console.log("Seed завершён.");
  console.log("Тестовый пароль для всех demo-пользователей: Qwerty123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
