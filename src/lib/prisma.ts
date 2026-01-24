// Prisma client singleton
// Note: This requires running `npx prisma generate` after database setup

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClient: any;

try {
  // Try to import the actual Prisma client
  // This will only work after `prisma generate` has been run
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const prismaModule = require("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;
} catch {
  // Prisma client not generated yet - provide a stub
  // This allows the app to type-check and build without a database
  console.warn(
    "⚠️  Prisma client not generated. Run `npx prisma generate` to enable database features."
  );
  PrismaClient = class StubPrismaClient {
    $connect() {
      return Promise.resolve();
    }
    $disconnect() {
      return Promise.resolve();
    }
    $transaction(fn: (tx: unknown) => Promise<unknown>) {
      return fn(this);
    }
    // Stub methods that return empty results
    get lead() {
      return createModelStub("Lead");
    }
    get activity() {
      return createModelStub("Activity");
    }
    get task() {
      return createModelStub("Task");
    }
    get template() {
      return createModelStub("Template");
    }
    get user() {
      return createModelStub("User");
    }
    get organization() {
      return createModelStub("Organization");
    }
    get organizationMember() {
      return createModelStub("OrganizationMember");
    }
    get cadencePolicy() {
      return createModelStub("CadencePolicy");
    }
    get account() {
      return createModelStub("Account");
    }
    get session() {
      return createModelStub("Session");
    }
  };
}

function createModelStub(modelName: string) {
  const notConfigured = () => {
    throw new Error(
      `Database not configured. Run 'npx prisma generate' and configure DATABASE_URL to use ${modelName} operations.`
    );
  };
  return {
    findMany: notConfigured,
    findFirst: notConfigured,
    findUnique: notConfigured,
    create: notConfigured,
    createMany: notConfigured,
    update: notConfigured,
    updateMany: notConfigured,
    delete: notConfigured,
    deleteMany: notConfigured,
    count: notConfigured,
    aggregate: notConfigured,
    groupBy: notConfigured,
    upsert: notConfigured,
  };
}

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
