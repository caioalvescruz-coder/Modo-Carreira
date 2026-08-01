export async function fetchDatabase() {
    try {
        const response = await fetch('/data/database.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar o database.json:', error);
        return null;
    }
}
