const http = require('http');
const { URL } = require('url');

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

function normalizePath(base, path) {
  if (!base) return path || '/';
  if (!path || path === '/') return base.startsWith('/') ? base : `/${base}`;
  const separator = base.endsWith('/') ? '' : '/';
  const formattedBase = base.startsWith('/') ? base : `/${base}`;
  return `${formattedBase}${separator}${path.startsWith('/') ? path.substring(1) : path}`;
}

function splitPath(path) {
  if (!path) return [];
  return path.split('/').filter(Boolean);
}

function matchRoute(routePath, actualPath) {
  const routeSegments = splitPath(routePath);
  const pathSegments = splitPath(actualPath);

  if (routeSegments.length !== pathSegments.length) {
    if (routeSegments.length === 0 && pathSegments.length === 0) {
      return { params: {} };
    }
    return null;
  }

  const params = {};
  for (let i = 0; i < routeSegments.length; i += 1) {
    const routeSegment = routeSegments[i];
    const actualSegment = pathSegments[i];

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(actualSegment);
      continue;
    }

    if (routeSegment !== actualSegment) {
      return null;
    }
  }

  return { params };
}

function decorateResponse(res) {
  res.status = function status(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function json(payload) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    }
    const body = payload === undefined ? 'null' : JSON.stringify(payload);
    res.end(body);
  };

  res.send = function send(payload) {
    if (typeof payload === 'object') {
      res.json(payload);
      return;
    }
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/plain');
    }
    res.end(payload);
  };

  return res;
}

class Router {
  constructor() {
    this.__isRouter = true;
    this.routes = [];
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  register(method, path, handler) {
    if (!METHODS.includes(method)) {
      throw new Error(`Unsupported method: ${method}`);
    }
    this.routes.push({ method, path: path || '/', handler });
  }

  get(path, handler) {
    this.register('GET', path, handler);
  }

  post(path, handler) {
    this.register('POST', path, handler);
  }

  put(path, handler) {
    this.register('PUT', path, handler);
  }

  delete(path, handler) {
    this.register('DELETE', path, handler);
  }
}

class Application extends Router {
  constructor() {
    super();
    this.locals = {};
    this.server = null;
  }

  use(pathOrMiddleware, maybeRouter) {
    if (typeof pathOrMiddleware === 'string' && maybeRouter && maybeRouter.__isRouter) {
      const basePath = pathOrMiddleware;
      maybeRouter.routes.forEach((route) => {
        const combinedPath = normalizePath(basePath, route.path);
        this.routes.push({ method: route.method, path: combinedPath || '/', handler: route.handler, middlewares: maybeRouter.middlewares });
      });
      return;
    }

    if (pathOrMiddleware && pathOrMiddleware.__isRouter) {
      pathOrMiddleware.routes.forEach((route) => {
        this.routes.push({ method: route.method, path: route.path || '/', handler: route.handler, middlewares: pathOrMiddleware.middlewares });
      });
      return;
    }

    this.middlewares.push(pathOrMiddleware);
  }

  handleRequest(req, res) {
    decorateResponse(res);

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.path = url.pathname;
    req.query = Object.fromEntries(url.searchParams.entries());
    req.params = {};

    const allMiddlewares = [...this.middlewares];

    const runMiddlewares = (middlewares, index, done) => {
      if (index >= middlewares.length) {
        done();
        return;
      }
      try {
        middlewares[index](req, res, () => runMiddlewares(middlewares, index + 1, done));
      } catch (err) {
        this.handleError(err, res);
      }
    };

    const handleRoute = () => {
      for (const route of this.routes) {
        if (route.method !== req.method) {
          continue;
        }
        const match = matchRoute(route.path || '/', req.path || '/');
        if (match) {
          req.params = match.params;
          const routeMiddlewares = route.middlewares || [];
          runMiddlewares(routeMiddlewares, 0, () => {
            try {
              route.handler(req, res);
            } catch (err) {
              this.handleError(err, res);
            }
          });
          return;
        }
      }
      res.status(404).json({ error: 'Not Found' });
    };

    runMiddlewares(allMiddlewares, 0, handleRoute);
  }

  handleError(err, res) {
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }

  listen(port, callback) {
    if (this.server) {
      throw new Error('Application already listening');
    }
    this.server = http.createServer(this.handleRequest.bind(this));
    return this.server.listen(port, callback);
  }
}

function express() {
  return new Application();
}

express.Router = function routerFactory() {
  return new Router();
};

express.json = function jsonParser() {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      req.body = {};
      next();
      return;
    }

    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        req.body = {};
        next();
        return;
      }
      try {
        req.body = JSON.parse(data);
        next();
      } catch (err) {
        res.status(400).json({ error: 'Invalid JSON payload' });
      }
    });
  };
};

module.exports = express;
