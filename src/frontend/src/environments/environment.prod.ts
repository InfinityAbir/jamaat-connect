export const environment = {
  production: true,
  // The Docker frontend proxies this path to the API container. Keeping the
  // browser on one origin avoids CORS and makes every authenticated workflow
  // work in the packaged application.
  apiUrl: '/api/v1'
};
