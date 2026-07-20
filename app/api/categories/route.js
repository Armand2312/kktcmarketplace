import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.categories.findMany({
            include: {

            },

            orderBy: {
                createdAt: "desc",
            }
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch categories" }), { status: 500 });
    }
}
