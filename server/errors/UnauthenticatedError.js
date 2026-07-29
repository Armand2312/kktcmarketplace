// UnauthenticatedError Custom Error Handler Class Implementation
// Kullanıcının kimliği doğrulanmamış, oturum açması gerekiyor.
import { AppError } from "./AppError";

export class UnauthenticatedError extends Error {
    constructor(message = "Authentication is required") {
        super(message, 401);
    }
}
