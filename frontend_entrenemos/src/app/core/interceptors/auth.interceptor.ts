import { HttpInterceptorFn } from "@angular/common/http";

/**
 * Interceptor para añadir el token JWT a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1) Recuperamos el token guardado en localStorage
  const token = localStorage.getItem("token");

  // 2) Si no hay token, dejamos la petición tal cual
  if (!token) {
    return next(req);
  }

  // 3) Evitamos añadir el header solo en llamadas de login (no en /me)
  if (req.url.includes("/api/auth/login")) {
    return next(req);
  }

  // 4) Clonamos la petición añadiendo el header Authorization: Bearer <token>
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 5) Pasamos la petición clonada al siguiente handler
  return next(authReq);
};
