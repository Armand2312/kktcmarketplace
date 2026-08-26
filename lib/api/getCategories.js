export async function getCategories() {
    try {
        const categories = await fetch('/api/categories', {
            method: 'GET',
        });
        return await categories.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    } 
}