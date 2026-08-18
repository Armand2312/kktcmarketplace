export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
            }
        });
        return new Response(JSON.stringify(products), { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
    }
}