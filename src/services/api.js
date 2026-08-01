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

export async function fetchTrackerStats() {
    try {
        const response = await fetch('/data/tracker_stats.json');
        if (!response.ok) return {};
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('Tracker stats not available:', error);
        return {};
    }
}
