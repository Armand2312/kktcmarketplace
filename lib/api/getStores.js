export async function getStores() {
    try {
        const stores = await fetch('api/stores', {
            method: 'GET',
        });
        return await stores.json();
    } catch (error) {
        console.error('Error fetching stores:', error);
        throw error;
    }
}