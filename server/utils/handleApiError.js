// Custom error sınıflarını oluşturmak tek başına yeterli değildir.
// Route Handler’ların bu hataları yakalayıp tutarlı JSON cevaplarına dönüştürebilmesi için buradaki Helper Function'ı oluşturuyoruz!


/** Bu aşamada custom error altyapısının temel zinciri tamamlanmış olur:
 * App Error 
 *    ↓
 * ValidationError / NotFoundError / ConflictError
 *    ↓
 * Service
 *    ↓
 * handleApiError()
 *    ↓
 * Route Handler response
 */

import { NextResponse } from "next/server";
import { AppError } from "../errors/AppError";

/**
 * This code snippet below converts application errors into consistent HTTP JSON responses.
 * 
 * Known operational errors expose their status code and message.
 * Unexpected errors return a generic 500 response.
 */

export function handleApiError(error) {
    // 'error instanceof AppError' -> hatanın bizim oluşturduğumuz custom error ailesinden gelip gelmediğini kontrol eder.
    // Şunların tamamı 'AppError' sınıfından türediği için bu koşulu sağlar: ValidationError, NotFoundError, ConflictError
    if(error instanceof AppError && error.isOperational) {
        return NextResponse.json(
            {
              success: false,
              error: {
                type: error.name,
                message: error.message,
              },  
            },
            {
              status: error.statusCode,
            }
        );
    }

    // Gerçek hata ise sunucu tarafında loglanır:
    console.error("Unexpected API error:", error);
    // Böyle bir durumda gerçek hata detayını kullanıcıya göndermiyoruz.(TypeError, stack trace, dosya yolları, veritabanı detayları)
    // Bunlar güvenlik ve bakım açısından dışarı açılmamalıdır.
    return NextResponse.json(
        {
            success: false,
            error: {
                type: "InternalServerError",
                message: "An unexpected server error occured",
            },
        },
        {
          status: 500,  
        },
    );
}