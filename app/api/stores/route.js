export async function GET() {
    try {
        const store = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
            }
        });
        return new Response(JSON.stringify(store), { status: 200 });
    } catch (error) {
        console.error("Error fetching store data:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch store data" }), { status: 500 });
    }
}