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

    console.error("Unexpected API error:", error);

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