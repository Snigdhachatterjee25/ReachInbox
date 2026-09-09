import prisma from "./src/lib/prisma.js";

async function main() {
  // 1. Create test user
  const user = await prisma.user.upsert({
    where: {
      email: "test@reachinbox.local",
    },
    update: {},
    create: {
      googleId: "test-google-id-001",
      email: "test@reachinbox.local",
      name: "Test User",
    },
  });

  console.log("User:", user.id);

  // 2. Create test sender
  const sender = await prisma.sender.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: "sender@reachinbox.local",
      },
    },
    update: {},
    create: {
      userId: user.id,
      email: "sender@reachinbox.local",
      name: "Test Sender",
    },
  });

  console.log("Sender:", sender.id);

  // 3. Create test campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      subject: "Test Email Campaign",
      body: "This is a test campaign.",
      startTime: new Date(Date.now() + 10 * 60 * 1000),
      delayMs: 2000,
      hourlyLimit: 100,
    },
  });

  console.log("Campaign:", campaign.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });