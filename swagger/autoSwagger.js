function generateSwaggerFromRoutes(router, basePath, tag) {
  const paths = {};

  router.stack.forEach((layer) => {
    if (!layer.route) {
      return;
    }

    const route = layer.route;

    const expressPath = route.path;

    const openApiPath = expressPath.replace(/:([^/]+)/g, "{$1}");

    const fullPath = `${basePath}${openApiPath}`;

    if (!paths[fullPath]) {
      paths[fullPath] = {};
    }

    Object.keys(route.methods).forEach((method) => {
      if (!route.methods[method]) {
        return;
      }

      paths[fullPath][method] = {
        tags: [tag],

        summary: `${method.toUpperCase()} ${fullPath}`,

        responses: {
          200: {
            description: "Successful response",
          },
        },
      };
    });
  });

  return paths;
}

module.exports = generateSwaggerFromRoutes;
