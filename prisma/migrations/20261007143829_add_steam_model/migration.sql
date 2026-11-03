-- CreateTable
CREATE TABLE "SteamAccount" (
    "id" TEXT NOT NULL,
    "emailId" TEXT,
    "steamUsername" TEXT NOT NULL,
    "steamPassword" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SteamAccount_pkey" PRIMARY KEY ("id")
);
