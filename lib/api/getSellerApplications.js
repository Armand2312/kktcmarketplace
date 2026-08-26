export async function getSellerApplications() {
    try {
        const sellerApplications = await fetch('/api/sellerApplications', {
            method: 'GET',
        });
        return await sellerApplications.json();
    } catch (error) {
        console.error('Error fetching seller applications:', error);
        throw error;
    }
}