export async function getProducts() {
    try {
        const products = await fetch('api/products', {
            method: 'GET',
        });
        return await products.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}