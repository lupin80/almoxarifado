/**
 * Middleware de autenticação (Simples para compatibilidade)
 * Em um ambiente real, usaríamos JWT (jsonwebtoken).
 * Aqui, extraímos o userId do header 'x-user-id' para fins de auditoria.
 */
const authMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  // Para fins de desenvolvimento e compatibilidade com o frontend atual,
  // permitimos passar sem o ID, mas avisamos no log.
  if (!userId) {
    console.warn('Aviso: Requisição sem x-user-id header. Auditoria ficará sem autor.');
    req.userId = null; // Ou um ID padrão de sistema
  } else {
    req.userId = userId;
  }

  next();
};

export default authMiddleware;
