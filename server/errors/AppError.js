// AppError Custom Error Handler Class Implementation


export class AppError extends Error { // Extends standard JS Error class.
    constructor(message, statusCode) {
        super(message); // Runs parent class error constructor.

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace?.(this, this.constructor);
    }
}

/** captureStackTrace ne yapıyor?
 * 
 * Hatanın hangi kod satırlarından geçtiğini gösteren stack trace bilgisini daha temiz hale getirir.
 * Buradaki '?.', optional chaining'dir. Metot mevcutsa çağrılır; mevcut değilse hata oluşmaz.
 */