// ==========================================
// LOCAL STORAGE - MINHA LISTA
// ==========================================

const Storage = {
    MY_LIST_KEY: 'cineradar_mylist',
    WATCHED_KEY: 'cineradar_watched',

    getMyList() {
        try {
            return JSON.parse(localStorage.getItem(this.MY_LIST_KEY)) || [];
        } catch {
            return [];
        }
    },

    addToList(item) {
        const list = this.getMyList();
        if (!list.find(i => i.id === item.id && i.type === item.type)) {
            list.push({ ...item, addedAt: new Date().toISOString() });
            localStorage.setItem(this.MY_LIST_KEY, JSON.stringify(list));
            showToast('Adicionado à sua lista!', 'success');
            return true;
        }
        showToast('Já está na sua lista!', 'info');
        return false;
    },

    removeFromList(id, type) {
        let list = this.getMyList();
        list = list.filter(i => !(i.id === id && i.type === type));
        localStorage.setItem(this.MY_LIST_KEY, JSON.stringify(list));
        showToast('Removido da sua lista', 'success');
        return true;
    },

    isInList(id, type) {
        return this.getMyList().some(i => i.id === id && i.type === type);
    },

    getWatched() {
        try {
            return JSON.parse(localStorage.getItem(this.WATCHED_KEY)) || [];
        } catch {
            return [];
        }
    },

    toggleWatched(id, type, title, poster) {
        let watched = this.getWatched();
        const index = watched.findIndex(i => i.id === id && i.type === type);

        if (index >= 0) {
            watched.splice(index, 1);
            localStorage.setItem(this.WATCHED_KEY, JSON.stringify(watched));
            showToast('Marcado como não assistido', 'info');
            return false;
        } else {
            watched.push({ id, type, title, poster, watchedAt: new Date().toISOString() });
            localStorage.setItem(this.WATCHED_KEY, JSON.stringify(watched));
            showToast('Marcado como assistido!', 'success');
            return true;
        }
    },

    isWatched(id, type) {
        return this.getWatched().some(i => i.id === id && i.type === type);
    }
};
