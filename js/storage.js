const Storage = {
    MY_LIST_KEY: 'cineradar_mylist',
    WATCHED_KEY: 'cineradar_watched',
    HISTORY_KEY: 'cineradar_history',

    getMyList() {
        try { return JSON.parse(localStorage.getItem(this.MY_LIST_KEY)) || []; } catch { return []; }
    },
    addToList(item) {
        const list = this.getMyList();
        if (!list.find(i => i.id === item.id && i.type === item.type)) {
            list.unshift({ ...item, addedAt: new Date().toISOString() });
            localStorage.setItem(this.MY_LIST_KEY, JSON.stringify(list));
            showToast('Adicionado à lista!', 'success');
            return true;
        }
        showToast('Já está na lista', 'info');
        return false;
    },
    removeFromList(id, type) {
        let list = this.getMyList().filter(i => !(i.id === id && i.type === type));
        localStorage.setItem(this.MY_LIST_KEY, JSON.stringify(list));
        showToast('Removido da lista', 'success');
    },
    isInList(id, type) {
        return this.getMyList().some(i => i.id === id && i.type === type);
    },

    getWatched() {
        try { return JSON.parse(localStorage.getItem(this.WATCHED_KEY)) || []; } catch { return []; }
    },
    toggleWatched(id, type, title, poster) {
        let w = this.getWatched();
        const idx = w.findIndex(i => i.id === id && i.type === type);
        if (idx >= 0) {
            w.splice(idx, 1);
            localStorage.setItem(this.WATCHED_KEY, JSON.stringify(w));
            showToast('Marcado como não assistido', 'info');
            return false;
        }
        w.unshift({ id, type, title, poster, watchedAt: new Date().toISOString() });
        localStorage.setItem(this.WATCHED_KEY, JSON.stringify(w));
        showToast('Marcado como assistido!', 'success');
        return true;
    },
    isWatched(id, type) {
        return this.getWatched().some(i => i.id === id && i.type === type);
    },

    addToHistory(id, type, title, poster) {
        let h = this.getHistory().filter(i => !(i.id === id && i.type === type));
        h.unshift({ id, type, title, poster, viewedAt: new Date().toISOString() });
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(h.slice(0, 50)));
    },
    getHistory() {
        try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || []; } catch { return []; }
    }
};
