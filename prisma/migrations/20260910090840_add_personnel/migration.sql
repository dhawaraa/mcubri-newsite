-- CreateEnum
CREATE TYPE "PersonnelType" AS ENUM ('EXECUTIVE', 'ACADEMIC', 'SUPPORT');

-- CreateTable
CREATE TABLE "personnel_departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name_th" VARCHAR(150) NOT NULL,
    "name_en" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "personnel_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnels" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "type" "PersonnelType" NOT NULL DEFAULT 'ACADEMIC',
    "title_th" VARCHAR(50),
    "title_en" VARCHAR(50),
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "academic_rank_th" VARCHAR(100),
    "academic_rank_en" VARCHAR(100),
    "position_th" VARCHAR(150) NOT NULL,
    "position_en" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "office_room" VARCHAR(100),
    "education" TEXT,
    "expertise" TEXT,
    "website_url" VARCHAR(500),
    "avatar_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "personnels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personnel_departments_tenant_id_display_order_idx" ON "personnel_departments"("tenant_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_departments_tenant_id_slug_key" ON "personnel_departments"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "personnels_tenant_id_type_display_order_idx" ON "personnels"("tenant_id", "type", "display_order");

-- CreateIndex
CREATE INDEX "personnels_tenant_id_department_id_idx" ON "personnels"("tenant_id", "department_id");

-- AddForeignKey
ALTER TABLE "personnel_departments" ADD CONSTRAINT "personnel_departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnels" ADD CONSTRAINT "personnels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnels" ADD CONSTRAINT "personnels_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "personnel_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
