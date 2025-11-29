export class UserProfile {

    static getProfile() {
        return {
            name: localStorage.getItem('user_name') || null,
            role: localStorage.getItem('user_role') || "alumno",
            level: parseInt(localStorage.getItem('braille_level') || "1"),
            lastPage: localStorage.getItem('last_page') || "index.html"
        };
    }

    static saveName(name) {
        localStorage.setItem('user_name', name);
    }

    static saveRole(role) {
        localStorage.setItem('user_role', role);
    }

    static updateLastPage(page) {
        localStorage.setItem('last_page', page);
    }

    static hasProfile() {
        return !!localStorage.getItem('user_name');
    }
}
