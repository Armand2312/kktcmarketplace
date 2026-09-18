import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        // Retrieve request data
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            console.log(name, email, password);
            return Response.json({ error: "Failed to fetch name, email, or password" }, { status: 400 });
        }

        // Normalize email for check
        const normalizedEmail = String(email).trim().toLowerCase();

        // Check db for existing email
        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            }
        })

        //Throw error if user exists
        if (existingUser) {
            return Response.json({error: "User already exists"}, {status: 409});
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        //Create user
        const createUser = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return Response.json(createUser, {status: 201});

    } catch(error) {
        console.error("Registration error", error);

        return Response.json({error: "Failed to register user"}, {status: 500});
    }
}