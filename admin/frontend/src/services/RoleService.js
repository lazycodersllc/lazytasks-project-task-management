import ApiService from "./ApiService";

// Get Users
export const getAllRoles = async () => {
    try {
        const response = await ApiService.fetchData({
            url: '/lazy-link/roles',
            method: 'get'
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}


