export async function GET() {
    try {
        const sellerApplication = await prisma.sellerApplication.findMany({
            orderBy: {
                createdAt: "desc",
            }
        });
        return new Response(JSON.stringify(sellerApplication), { status: 200 })
    } catch (error) {
        console.error("Error fetching seller applications:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch seller applications" }), { status: 500 });
    }
}