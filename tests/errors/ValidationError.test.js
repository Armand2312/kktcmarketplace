import { describe, it, expect} from "vitest";
import { ValidationError } from "../../server/errors/ValidationError";

// describe() birbiriyle ilişkili testleri gruplandırır. Burada diyoruz ki bundan sonraki testler ValidationError ile ilgilir.
describe("ValidationError", () => {
    // 'it' tek bir davranışı test ediyor. ValidationError, status code 400 olan bir error oluşturmalıdır.
    it("should create an error with status code 400", () => {
        // Arrange/Act -> test edeceğimiz nesneyi oluşturuyoruz.
        const error = new ValidationError("Invalid input.");
        // Assert -> Sonucun beklediğimiz gibi olup olmadığını kontrol ediyoruz. 
        // Buradaki: 'expect(...)' -> Bu değeri kontrol et.
        // '.toBe()' ise: Bu değerin tam olarak şu olmasını bekliyorum.
        expect(error.message).toBe("Invalid input.");
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe("ValidationError");
        expect(error.isOperational).toBe(true);
    });
});