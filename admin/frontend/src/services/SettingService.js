import ApiService from "./ApiService";

// Get Users
export const getSettings = async () => {
    try {
        const response = await ApiService.fetchData({
            url: '/settings',
            method: 'get'
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

// Update setting

export const Lazytask_updateSetting = async (data) => {

    const response = await ApiService.fetchData({
        url: `/settings`,
        method: 'post',
        headers: {
            "Accept": "application/json, text/plain, */*",
            'Content-type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        },
        data,
    })
console.log(response.data)
    return response.data;
}



