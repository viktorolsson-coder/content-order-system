import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_CLIENTS: Array<{ name: string; monthlyTarget: number }> = [
  { name: "Acme Co", monthlyTarget: 20 },
  { name: "Northwind", monthlyTarget: 15 },
  { name: "Globex", monthlyTarget: 30 },
];

async function main() {
  for (const client of SEED_CLIENTS) {
    await prisma.client.upsert({
      where: { name: client.name },
      update: { monthlyTarget: client.monthlyTarget },
      create: client,
    });
  }
  console.log(`Seeded ${SEED_CLIENTS.length} clients.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
