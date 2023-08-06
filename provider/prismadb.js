import { PrismaClient } from "@prisma/client";

// Create a global Prisma client instance
let prisma;

// Helper function to initialize the Prisma client
export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}
