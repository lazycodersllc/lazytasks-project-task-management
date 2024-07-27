const appConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/lazy-login',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    liveApiUrl: `${appLocalizer?.apiUrl}/pms/api/v1`,
    liveSiteUrl: `${appLocalizer?.homeUrl}`,
    localApiUrl: 'http://localhost:9000',
}

export default appConfig
