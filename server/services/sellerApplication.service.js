import { prisma } from "@/lib/prisma";

/**
 * Approves a pending seller application.
 *
 * The following operations are executed atomically (atomicity -> ALL OR NOTHING!):
 * 1. Approve the seller application
 * 2. Change the applicant's role to SELLER
 * 3. Create a store for the applicant
 */

export async function approveSellerApplication(applicationId) {
  if (!applicationId) {
    throw new Error("Seller application ID is required.");
  }

  const application = await prisma.sellerApplication.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      applicant: {
        include: {
          store: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Seller application was not found.");
  }

  if (application.status !== "PENDING") {
    throw new Error("Only pending seller applications can be approved.");
  }

  if (application.applicant.store) {
    throw new Error("The applicant already owns a store.");
  }

  // Where the Concept of Atomicity Initiates!
  // If any of these operations fail, transcation will be failed and each of these operation will automatically rollback.
  // API Route dosyası hem HTTP hem de business logic ile uğraşmasın diye bu işlemleri burada yapıyoruz.
  return prisma.$transaction(async (tx) => {
    const approvedApplication = await tx.sellerApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "APPROVED",
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });

    const updatedUser = await tx.user.update({
      where: {
        id: application.applicantId,
      },
      data: {
        role: "SELLER",
      },
    });

    const store = await tx.store.create({
      data: {
        name: application.businessName,
        description: application.description,
        ownerId: application.applicantId,
      },
    });

    return {
      application: approvedApplication,
      user: updatedUser,
      store,
    };
  });
}