-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT[],
    "linkTtd" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "santri" (
    "id" TEXT NOT NULL,
    "nomorInduk" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipe" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "santriId" TEXT,
    "inputBy" TEXT NOT NULL,
    "notaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfirmasi_kas" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,
    "prioritas" TEXT NOT NULL DEFAULT 'Normal',
    "tujuan" TEXT NOT NULL DEFAULT 'Bendahara',
    "status" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
    "catatanVerif" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "konfirmasi_kas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rka" (
    "id" TEXT NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "statusBndhr" TEXT NOT NULL DEFAULT 'Menunggu',
    "statusKetua" TEXT NOT NULL DEFAULT 'Menunggu',
    "pengaju" TEXT NOT NULL,
    "catatanBndhr" TEXT,
    "catatanKetua" TEXT,
    "approvedBndhr" TEXT,
    "approvedKetua" TEXT,
    "approvedBndhrAt" TIMESTAMP(3),
    "approvedKetuaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rka_item" (
    "id" TEXT NOT NULL,
    "rkaId" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" INTEGER NOT NULL,

    CONSTRAINT "rka_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "divisi" TEXT NOT NULL,
    "pengaju" TEXT NOT NULL,
    "statusBndhr" TEXT NOT NULL DEFAULT 'Menunggu',
    "statusKetua" TEXT NOT NULL DEFAULT 'Menunggu',
    "catatanBndhr" TEXT,
    "catatanKetua" TEXT,
    "approvedBndhrAt" TIMESTAMP(3),
    "approvedKetuaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "libur_kas" (
    "id" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "divisi" TEXT NOT NULL,
    "alasan" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "libur_kas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_sistem" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "appTitle" TEXT NOT NULL DEFAULT 'Sistem Kas Angkatan Artsacala',
    "appSubtitle" TEXT NOT NULL DEFAULT 'Kas Angkatan',
    "appInstansi" TEXT NOT NULL DEFAULT 'MA IT Baitul Qur''an Al Jahra Magetan',
    "appOrganisasi" TEXT NOT NULL DEFAULT 'Angkatan Artsacala',
    "appAlamat" TEXT,
    "appEmail" TEXT,
    "appHp" TEXT,
    "logoUrl" TEXT,
    "nominalKas" INTEGER NOT NULL DEFAULT 20000,
    "tahunAktif" TEXT NOT NULL DEFAULT '2026',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "konfig_sistem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "santri_nomorInduk_key" ON "santri"("nomorInduk");

-- CreateIndex
CREATE UNIQUE INDEX "libur_kas_bulan_tahun_divisi_key" ON "libur_kas"("bulan", "tahun", "divisi");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "santri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfirmasi_kas" ADD CONSTRAINT "konfirmasi_kas_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rka_item" ADD CONSTRAINT "rka_item_rkaId_fkey" FOREIGN KEY ("rkaId") REFERENCES "rka"("id") ON DELETE CASCADE ON UPDATE CASCADE;
