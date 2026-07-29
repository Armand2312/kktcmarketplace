// ValidationError Custom Error Handler Class Implementation
import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
    constructor(message = "Invalid request data.") {
        super(message, 400);
    }
}

/** Bu hata şu durumlarda kullanılabilir:
 * 
 * ID gönderilmemişse
 * Ret nedeni boşsa
 * Beklenen veri tipi yanlışsa
 * Zorunlu alan eksikse
 */