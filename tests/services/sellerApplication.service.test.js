import { describe, it, expect, vi, beforeEach } from "vitest";

// Prisma'yı mock edelim. (Gerçek Postgresql veritabanına erişmemesi için.)
vi.mock("@/lib/prisma", () => ({ // Test sırasında herhangi bir kod '@/lib/prisma' import ederse gerçek modülü kullanma; benim verdiğim sahte versiyonu kullan.
    prisma: {
        sellerApplication: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";

import {
    approveSellerApplication, rejectSellerApplication, getPendingSellerApplications, getSellerApplicationByApplicantId,
} from "../../server/services/sellerApplication.service";

import { before } from "node:test";

describe("rejectSellerApplication", () => {
    // 'beforeEach()' her 'it()' çalışmadan önce bu kodu çalıştır demektir.
    beforeEach(() => {
        vi.clearAllMocks(); // ise mock fonksiyonlarının önceki testlerden kalan 'çağrı geçmişini' temizler.
    });

  it("should throw ValidationError when applicationId is missing", async () => {
    await expect(
      rejectSellerApplication(undefined, "Missing business documents."),
    ).rejects.toMatchObject({
      // toMatchObject() -> Fırlatılan error nesnesinin bu özelliklere sahip olmasını bekliyorum.
      // '.rejects' -> Vitest'e bu Promise'in başarısız olmasını bekliyorum diyoruz.
      name: "ValidationError",
      statusCode: 400,
      message: "Seller application ID is required.",
    });
  });

  /** Bu ayrımı bilmek önemli:
   *  Synchronous Error -> toThrow()
   *  Asynchronous Promise Rejection -> await expect(...).rejects
   */


  it("should throw ValidationError when rejectionReason is empty", async () => {
    await expect(
      rejectSellerApplication("application-123", "  "),
    ).rejects.toMatchObject({
      name: "ValidationError",
      statusCode: 400,
      message: "Rejection reason is required.",
    });
  });

  
  it("should throw NotFoundError when seller application does not exist", async () => {
    // ARRANGE -> Database'in davranışını hazırlıyoruz.
    // Sahte Prisma'ya: "findUnique çağrılırsa null döndür" diyoruz.
    prisma.sellerApplication.findUnique.mockResolvedValue(null);

    // ACT + ASSERT
    // Servisi çalıştırıyoruz ve NotFoundError vermesini bekliyoruz.
    // Başvuru bulunamadığında servis doğru 'NotFoundError'ı' üretiyor mu?
    await expect(
      rejectSellerApplication("application-123", "Missing business documents."),
    ).rejects.toMatchObject({
      name: "NotFoundError",
      statusCode: 404,
      message: "Seller application was not found.",
    });

    // ASSERT
    // Servisin Prisma'yı doğru application ID ile çağırdığını kontrol ediyoruz.
    // Servisimiz başvuruyu ararken Prisma'ya doğru sorguyu gönderdi mi?
    expect(prisma.sellerApplication.findUnique).toHaveBeenCalledWith({
      where: {
        id: "application-123",
      },
    });
  });


    it("should throw ConflictError when application is not pending", async() => {
        /** Burada şunu test ediyoruz:
         * 
         * Servisimize "APPROVED" bir application geldiğinde bizim yazdığımız
         * Business Logic onu reddetmeyi engelliyor mu?
         * 
         */
        const approvedApplication = {
            id: "application-123",
            applicantId: "user-123",
            businessName: "Test Store",
            status: "APPROVED",
        };

        prisma.sellerApplication.findUnique.mockResolvedValue(
            approvedApplication
        );

        await expect(
            rejectSellerApplication(
                "application-123",
                "Missing business documents."
            )
        ).rejects.toMatchObject({
            name: "ConflictError",
            statusCode: 409,
            message: "Only pending seller applications can be rejected."
        });
        // ASSERTION
        // Geçersiz durumda olan application için servisimiz yanlışlıkla database update yapmaya çalıştı mı?
        expect(
            prisma.sellerApplication.update
        ).not.toHaveBeenCalled();
    });

    it("should reject a pending seller application successfully", async () => {
        const pendingApplication = {
            id: "application-123",
            applicantId: "user-123",
            businessName: "Test Store",
            status: "PENDING",
        };

        const rejectedApplication = {
            ...pendingApplication,
            status: "REJECTED",
            rejectionReason: "Missing business documents.",
            reviewedAt: new Date(),
        };

        prisma.sellerApplication.findUnique.mockResolvedValue(
            pendingApplication
        );

        prisma.sellerApplication.update.mockResolvedValue(
            rejectedApplication
        );

        const result = await rejectSellerApplication(
            "application-123",
            "   Missing business documents.   " // 'trim() davranışını test etmek için boşluklu yaptık.'
        );
        // Servisin çağrıyı tamamladıktan sonra döndürdüğü sonuç doğru mu? 
        expect(result).toMatchObject({
            id: "application-123",
            status: "REJECTED",
            rejectionReason: "Missing business documents.",
        });
        // Servis Prisma’ya doğru update verisini gönderdi mi?
        expect(prisma.sellerApplication.update).toHaveBeenCalledWith({
            where: {
                id: "application-123",
            },
            data: {
               status: "REJECTED",
               rejectionReason: "Missing business documents.",
               reviewedAt: expect.any(Date), 
            },
        });        
    });
});

// approveSellerApplication() ve $transaction mocking

/** approveSellerApplication() başarılı olduğunda transaction içinde birden fazla değişiklik yapıyorduk:
 * 
 * PENDING MI? 
 *     ↓
 * Applicant zaten Store sahibi mi?
 *     ↓
 * $transaction başlar.
 *     ↓
 * User.role -> SELLER
 *     ↓
 * Applications.status -> APPROVED
 *     ↓
 * Transaction tamamlanır.
 */

// Transaction içerisinde sorgular normal 'prisma' üzerinden değil, callback'e verilen 'tx' üzerinden çalışır.
// Bu nedenle testte sadece ana Prisma nesnesini mocklamak yetersizdir. Sahte bir 'tx nesnesi'de oluşturacağız.

describe("approveSellerApplication", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    
    it("should throw NotFoundError when seller application does not exist", async() => {
        prisma.sellerApplication.findUnique.mockResolvedValue(null);

        await expect(
            approveSellerApplication("application-123")
        ).rejects.toMatchObject({
            name: "NotFoundError",
            statusCode: 404,
            message: "Seller application was not found.", 
        });

        expect(prisma.sellerApplication.findUnique
        ).toHaveBeenCalledWith({ // 'toHaveBeenCalledWith()' içindeki Prisma sorgusunun gerçek servis koduyla birebir aynı olması gerekiyor.
            where: {
                id: "application-123",
            },
            include: {
                applicant: {
                    include: {
                        store: true,
                    },
                },
            },
        });
    });

    it("should throw ConflictError when application is not pending", async() => {
        const approvedApplication = {
            id: "application-123",
            status: "APPROVED",
            applicant: {
                id: "user-123",
                store: null,
            },
        };

        prisma.sellerApplication.findUnique.mockResolvedValue(
            approvedApplication
        );

        await expect(
            approveSellerApplication("application-123")
        ).rejects.toMatchObject({
            name: "ConflictError",
            statusCode: 409,
            message: "Only pending seller applications can be approved.",
        });
    });

        // Existing Store Guard testi

        /** Bu test şunu doğruluyor:
        * 
        * PENDING application var
        *           ↓
        * Applicant zaten Store sahibi
        *           ↓
        * ConflictError
        *           ↓
        * Transaction başlamıyor
        * 
        */
        
        it("should throw ConflictError when applicant already owns a store", async() => {
            const pendingApplication = {
                id: "application-123",
                applicantId: "user-123",
                status: "PENDING",
                applicant: {
                    id: "user-123",
                    store: {
                        id: "store-123",
                    },
                },
            };

            prisma.sellerApplication.findUnique.mockResolvedValue(
                pendingApplication
            );

            await expect(
                approveSellerApplication("application-123")
            ).rejects.toMatchObject({
                name: "ConflictError",
                statusCode: 409,
                message: "The applicant already owns a store.",
            });
            
        });

        it("should approve a pending seller application successfully", async() => {
            const pendingApplication = {
                id: "application-123",
                applicantId: "user-123",
                businessName: "Test Store",
                description: "Test store description",
                status: "PENDING",
                applicant: {
                    id: "user-123",
                    store: null,
                },
            };

            const approvedApplication = {
                ...pendingApplication,
                status: "APPROVED",
                rejectionReason: null,
                reviewedAt: new Date(),
            };

            const updatedUser = {
                id: "user-123",
                role: "SELLER",
            };

            const createdStore = {
                id: "store-123",
                name: "Test Store",
                ownerId: "user-123",
            };

            const tx = {
                sellerApplication: {
                    update: vi.fn().mockResolvedValue(approvedApplication),
                },
                user: {
                    update: vi.fn().mockResolvedValue(updatedUser),
                },
                store: {
                    create: vi.fn().mockResolvedValue(createdStore),
                },
            };

            prisma.sellerApplication.findUnique.mockResolvedValue(
                pendingApplication
            );

            // Bu satır gerçek transaction açmıyor. Production kodundaki callback'i alıp sahte 'tx' ile çalıştırıyor.
            // Yani business logic gerçek, database bağlantısı sahte.
            prisma.$transaction.mockImplementation(async (callback) => {
                return callback(tx);
            });

            const result = await approveSellerApplication(
                "application-123"
            );

            expect(tx.sellerApplication.update).toHaveBeenCalledWith({
                where: {
                    id: "application-123",
                },

                data: {
                    status: "APPROVED",
                    rejectionReason: null,
                    reviewedAt: expect.any(Date),
                },
            });

            expect(tx.user.update).toHaveBeenCalledWith({
                where: {
                    id: "user-123",
                },
                data: {
                    role: "SELLER",
                },
            });

            expect(tx.store.create).toHaveBeenCalledWith({
                data: {
                    name: "Test Store",
                    description: "Test store description",
                    ownerId: "user-123",
                },
            });

            expect(result).toMatchObject({
                application: {
                    status: "APPROVED",
                },
                user: {
                    role: "SELLER",
                },
                store: {
                    id: "store-123",
                    ownerId: "user-123",
                },
            });
        });

        // Transaction içindeki bir database işlemi başarısız olduğunda service ne yapıyor?
        // Bu Unit test Database'in gerçekten rollback yaptığını kanıtlamıyor. Bunu Integration Test ile doğrularız.
        // Transaction callback'i içindeki işlem hata verirse 'approveSellerApplication()' başarılı sonuç döndürmüyor ve hata yukarı doğru taşınıyor.

        /** Neden hata 'Error' olarak yukarı çıkıyor?
         *  Service içinde transaction'ı çevreleyen 'try', 'catch' vb. bir yapı yoksa, 'store.create()' tarafından reject edilen Promise yukarı doğru yayılır.
         *  tx.store.create() ✗
         *         ↓
         *  transaction callback reject
         *         ↓
         *  approveSellerApplication reject
         *         ↓
         *  Route Handler catch
         * 
         *  İleride Route Handlerlar:
         *  catch(error) {
         *      return handleApiError(error);
         *  } 
         *  ile bunu yakalayacak. 
         *  Hatta gelen hata bizim AppError ailesinden değilse 'HandleApiError()' onu '500 Internal Server Error' olarak ele alacak!
         */

        it("should propagate an error when store creation fails inside the transaction", async() => {
            const pendingApplication = {
                id: "application-123",
                applicantId: "user-123",
                businessName: "Test Store",
                description: "Test store description",
                status: "PENDING",
                applicant: {
                    id: "user-123",
                    store: null,
                },
            };

            const approvedApplication = {
                ...pendingApplication,
                status: "APPROVED",
            };

            const updatedUser = {
                id: "user-123",
                role: "SELLER",
            };

            const databaseError = new Error("Store creation failed.");

            const tx = {
                sellerApplication: {
                    update: vi.fn().mockResolvedValue(approvedApplication),
                },
                user: {
                    update: vi.fn().mockResolvedValue(updatedUser),
                },
                // store.create() çağrıldığında database işlemi başarısız olmuş gibi davran.
                store: {
                    create: vi.fn().mockRejectedValue(databaseError),
                },
            };

            prisma.sellerApplication.findUnique.mockResolvedValue(
                pendingApplication
            );

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback(tx);
            });

            await expect(
                approveSellerApplication("application-123")
            ).rejects.toThrow("Store creation failed.");

            expect(tx.sellerApplication.update).toHaveBeenCalled();
            expect(tx.user.update).toHaveBeenCalled();
            expect(tx.store.create).toHaveBeenCalled();
        });

        /** LAST ASSERTION -> Çünkü şunu doğruluyoruz:
            * APPROVED application
            *      ↓
            * Business rule engelledi.
            *      ↓
            * Transaction BAŞLAMADI ✓
            * 
            * Bu yalnızda doğru error'ı değil, yanlış database işlemlerinin gerçekleşmediğini de test ediyor.
            */
        
            expect(prisma.$transaction).not.toHaveBeenCalled();

});


describe("getPendingSellerApplications", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /** Burada iki şeyi test ediyoruz:
     * Service doğru Prisma Query'sini kuruyor mu?
     *                  +
     * Prisma'dan gelen sonucu değiştirmeden geri dönüyor mu?
     */
    it("should return pending seller applications ordered from oldest to newest", async() => {
        const applications = [
            {
                id: "application-1",
                status: "PENDING",
                createdAt: new Date("2026-08-01"),
            },
            {
                id: "application-2",
                status: "PENDING",
                createdAt: new Date("2026-08-02"),
            },
        ];

        prisma.sellerApplication.findMany.mockResolvedValue(
            applications
        );

        const result = await getPendingSellerApplications();

        expect(
            prisma.sellerApplication.findMany
        ).toHaveBeenCalledWith({
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

        // toEqual() burada uygundur çünkü array ve object yapısını karşılaştırıyoruz.
        expect(result).toEqual(applications);
    });
});

describe("getSellerApplicationByApplicantId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Bu fonksiyon için özellikle "kullanıcın henüz başvurusu yok" senaryosunu test etmek istiyoruz.
    // Bu test özellikle önemli çünkü burada 'null' bir hata değil.

    /** Business anlamı:
     * 
     *  User mevcut.
     *       ↓
     *  SellerApplication yok.
     *       ↓
     *      null
     *       ↓
     *  Frontend başvuru formunu gösterebilir.
     *  Yani:
     *  "expect(result).toBeNull();"
     *  ile bu davranışı kontrat haline getiriyoruz.
     */

    it("should return null when applicant has no seller application", async() => {
        prisma.sellerApplication.findUnique.mockResolvedValue(
            null
        );

        const result = 
            await getSellerApplicationByApplicantId("user-123");

            expect(
                prisma.sellerApplication.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    applicantId: "user-123",
                },
            });

            expect(result).toBeNull();
    });
});