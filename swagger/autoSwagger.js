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

      const methodLower = method.toLowerCase();
      const operation = {
        tags: [tag],
        summary: `${method.toUpperCase()} ${fullPath}`,
        responses: {
          200: {
            description: "Successful response",
          },
        },
      };

      // Add requestBody for POST, PUT, PATCH
      if (["post", "put", "patch"].includes(methodLower)) {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: getSchemaForPath(methodLower, fullPath),
            },
          },
        };
      }

      paths[fullPath][methodLower] = operation;
    });
  });

  return paths;
}

function getSchemaForPath(method, path) {
  // Movies
  if (path === "/mb/api/v1/movies" && method === "post") {
    return {
      type: "object",
      required: ["name", "description", "cast"],
      properties: {
        name: { type: "string", example: "Inception" },
        description: { type: "string", example: "A thief who steals corporate secrets through the use of dream-sharing technology." },
        cast: {
          type: "array",
          items: { type: "string" },
          example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
        },
      },
    };
  }

  if (path.match(/^\/mb\/api\/v1\/movies\/\{[^}]+\}$/) && (method === "put" || method === "patch")) {
    return {
      type: "object",
      properties: {
        name: { type: "string", example: "Inception" },
        description: { type: "string", example: "A thief who steals corporate secrets through the use of dream-sharing technology." },
        cast: {
          type: "array",
          items: { type: "string" },
          example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
        },
      },
    };
  }

  // Theatres
  if (path === "/mb/api/v1/theatres" && method === "post") {
    return {
      type: "object",
      required: ["name", "description", "city", "pinCode"],
      properties: {
        name: { type: "string", example: "PVR Cinemas" },
        description: { type: "string", example: "Premium multiplex with IMAX screens." },
        city: { type: "string", example: "Mumbai" },
        pinCode: { type: "string", example: "400001" },
      },
    };
  }

  if (path.match(/^\/mb\/api\/v1\/theatres\/\{[^}]+\}$/) && (method === "put" || method === "patch")) {
    return {
      type: "object",
      properties: {
        name: { type: "string", example: "PVR Cinemas" },
        description: { type: "string", example: "Premium multiplex with IMAX screens." },
        city: { type: "string", example: "Mumbai" },
        pinCode: { type: "string", example: "400001" },
      },
    };
  }

  if (path.match(/^\/mb\/api\/v1\/theatres\/\{[^}]+\}\/movies$/) && method === "patch") {
    return {
      type: "object",
      required: ["insert", "movieIds"],
      properties: {
        insert: { type: "boolean", example: true },
        movieIds: {
          type: "array",
          items: { type: "string" },
          example: ["64a1b2c3d4e5f600123456789"],
        },
      },
    };
  }

  // Shows
  if (path === "/mb/api/v1/shows" && method === "post") {
    return {
      type: "object",
      required: ["movie", "theatre", "date", "startTime", "screen"],
      properties: {
        movie: { type: "string", example: "64a1b2c3d4e5f600123456789" },
        theatre: { type: "string", example: "64a1b2c3d4e5f600123456790" },
        date: { type: "string", format: "date", example: "2024-12-25" },
        startTime: { type: "string", example: "14:30" },
        screen: { type: "string", example: "Screen 1" },
      },
    };
  }

  if (path.match(/^\/mb\/api\/v1\/shows\/\{[^}]+\}$/) && method === "patch") {
    return {
      type: "object",
      properties: {
        startTime: { type: "string", example: "14:30" },
        screen: { type: "string", example: "Screen 1" },
        date: { type: "string", format: "date", example: "2024-12-25" },
        price: {
          type: "object",
          properties: {
            regular: { type: "number", example: 150 },
            gold: { type: "number", example: 250 },
            platinum: { type: "number", example: 350 },
          },
        },
        totalSeats: {
          type: "object",
          properties: {
            regular: { type: "number", example: 100 },
            gold: { type: "number", example: 50 },
            platinum: { type: "number", example: 30 },
          },
        },
      },
    };
  }

  // Default fallback schema
  return {
    type: "object",
    properties: {},
  };
}

module.exports = generateSwaggerFromRoutes;
