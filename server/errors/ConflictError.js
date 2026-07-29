// ConflictError Custom Error Handler Class Implementation

import { AppError } from "./AppError";

export class ConflictError extends AppError {
    constructor(message = "The requested conflicts with the current resource state") {
        super(message, 409);
    }
}

