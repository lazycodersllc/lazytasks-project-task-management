const appConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/lazy-login',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    liveApiUrl: `${appLocalizer?.apiUrl}/pms/api/v1`,
    liveSiteUrl: `${appLocalizer?.homeUrl}`,
    // liveApiUrl: 'https://lazytasks.appza.net/wp-json/pms/api/v1',
    // liveSiteUrl: 'https://lazytasks.appza.net',
    localApiUrl: 'http://localhost:9000',
}

export default appConfig
