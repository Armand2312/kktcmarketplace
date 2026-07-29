// ForbiddenError Custom Error Handler Class Implementation
// Kullanıcının kimliği doğrulanmış, fakat işlem için gerekli yetkisi yok.
import { AppError } from "./AppError";

export class ForbiddenError extends Error {
    constructor(message = "You are not allowed to perform this action") {
        super(message, 403);
    }
}