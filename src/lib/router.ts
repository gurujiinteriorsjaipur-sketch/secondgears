// Simple SPA Router
type RouteHandler = (params?: Record<string, string>) => void;

interface Route {
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
}

class Router {
  private routes: Route[] = [];
  private notFoundHandler: RouteHandler = () => {};

  addRoute(path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const pattern = path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      pattern: new RegExp(`^${pattern}$`),
      handler,
      paramNames
    });
  }

  setNotFound(handler: RouteHandler) {
    this.notFoundHandler = handler;
  }

  navigate(path: string) {
    window.history.pushState({}, '', path);
    this.resolve();
  }

  resolve() {
    const path = window.location.pathname;
    for (const route of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        route.handler(params);
        return;
      }
    }
    this.notFoundHandler();
  }

  init() {
    window.addEventListener('popstate', () => this.resolve());
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[data-route]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) this.navigate(href);
      }
    });
    this.resolve();
  }
}

export const router = new Router();
