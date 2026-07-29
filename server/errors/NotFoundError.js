// NotFoundError Custom Error Handler Class Implementation

import { AppError  } from "./AppError";

export class NotFoundError extends AppError {
    constructor(message = "Requested resource was not found.") {
        super(message, 404);
    }
}

