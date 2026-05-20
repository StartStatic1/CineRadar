const Loader = {
    render() {
        const main = $('#main-content');
        if (!main) return;
        main.innerHTML = `
            <div class="loader" style="padding-top:40vh">
                <div class="loader-spinner"></div>
            </div>
        `;
    }
};
