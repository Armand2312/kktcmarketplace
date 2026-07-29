import { prisma } from "@/lib/prisma";
import { ValidationError } from "../errors/ValidationError";
import { NotFoundError } from "../errors/NotFoundError";
import { ConflictError } from "../errors/ConflictError";

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
    throw new ValidationError("Seller application ID is required.");
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
    throw new NotFoundError("Seller application was not found.");
  }
  // Örneğin Başvuru Durumu: APPROVED, ama istenen islem: Tekrar APPROVE, Bu nedenle: ConflictError -> 409 Conflict
  if (application.status !== "PENDING") {
    throw new ConflictError("Only pending seller applications can be approved.");
  }
  // Kullanıcı zaten bir mağazaya sahip olduğu için yeni mağaza oluşturma isteği mevcut kaynak durumuyla çelişir -> 409 Conflict
  if (application.applicant.store) {
    throw new ConflictError("The applicant already owns a store.");
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


/**
 * This service code below rejects a pending seller application.
 *
 * A rejected application:
 * 1. Changes its status from PENDING to REJECTED
 * 2. Stores the rejection reason
 * 3. Records when the application was reviewed
 *
 * The applicant's user role is not changed,
 * and no store is created.
 */

export async function rejectSellerApplication(
  applicationId,
  rejectionReason
) {
  if(!applicationId) {
    throw new ValidationError("Seller application ID is required.");
  }

  if (
    typeof rejectionReason !== "string" ||
    rejectionReason.trim().length === 0
  ) {
    /** Burada ValidationError kullanıyoruz çünkü gönderilen veri:
     * 
     * eksik olabilir,
     * yanlış türde olabilir,
     * boş olabilir.
     */
    throw new ValidationError("Rejection reason is required.");
  }

  const application = await prisma.sellerApplication.findUnique({
    where: {
      id: applicationId,
    },
  });
  // Başvuru bulunmadığında NotFoundError
  if(!application){
    throw new NotFoundError("Seller application was not found.");
  }
  // Başvuru daha önce işlenmişse ConflictError
  if(application.status !== "PENDING") {
    throw new ConflictError("Only pending seller applications can be rejected.");
  }

  const rejectedApplication =
    await prisma.sellerApplication.update({
      where: {
        id: application.id,
      },

      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
        reviewedAt: new Date(),
      },
    });

    return rejectedApplication;
}


/**
 * Returns all pending seller application.
 * 
 * Applications are ordered from oldest to newest so that
 * earlier applications can be reviewed first.
 */

export async function getPendingSellerApplications() {
  const applications = await prisma.sellerApplication.findMany({
    where: {
      status: "PENDING",
    },

    orderBy: {
      createdAt: "asc",
    },

    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return applications;
}

/*
findUnique()
→ kayıt yoksa null

findMany()
→ kayıt yoksa []
*/


/**
 * Returns a seller application by its unique ID.
 * 
 * The related applicant information is included,
 * but sensitive user fields are not returned.
 */

export async function getSellerApplicationById(applicationId){
  if(!applicationId) {
    throw new ValidationError("Seller application ID is required.");
  }

  const application = await prisma.sellerApplication.findUnique({
    where: {
      id: applicationId,
    },

    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if(!application){
    throw new NotFoundError("Seller application was not found.");
  }
  return application;
}


/**
 * Returns the seller application belonging to a specific applicant.
 * 
 * Each user can have at most one seller application because
 * applicantId is unique in the database schema.
 */

export async function getSellerApplicationByApplicantId(applicantId){
  if(!applicantId) {
    throw new ValidationError("ApplicantId is required.");
  }

  const application = await prisma.sellerApplication.findUnique({
    where: {
      applicantId,
    },
  });

  return application;
}