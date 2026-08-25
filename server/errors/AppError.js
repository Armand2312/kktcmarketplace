// AppError Custom Error Handler Class Implementation


export class AppError extends Error { // Extends standard JS Error class.
    constructor(message, statusCode) {
        super(message); // Runs 'Error' constructor parent class. 

        this.name = this.constructor.name; // Oluşturulan gerçek hata sınıfının adını kaydeder => "new NotFoundError("Application not found."); için 'error.name' şu olur: 'NotFoundError' "
        this.statusCode = statusCode;
        this.isOperational = true; // Hata öngörülebilir mi, değil mi?

        Error.captureStackTrace?.(this, this.constructor);
    }
}

/** captureStackTrace ne yapıyor?
 * 
 * Hatanın hangi kod satırlarından geçtiğini gösteren stack trace bilgisini daha temiz hale getirir.(debug için)
 * Buradaki '?.', optional chaining'dir. captureStackTrace Metodu mevcutsa çağrılır; mevcut değilse hata oluşmaz.
 */