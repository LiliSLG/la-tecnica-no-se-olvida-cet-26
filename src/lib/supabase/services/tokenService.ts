// src/lib/services/tokenService.ts
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";

type TokenType = "organizacion" | "persona" | "proyecto";

interface TokenData {
  entityId: string;
  type: TokenType;
  expiresAt: number;
  createdAt: number;
}

class TokenService {
  // Generar token seguro con metadata
  generateToken(
    entityId: string,
    type: TokenType,
    expiryDays: number = 30
  ): string {
    const expiresAt = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    const createdAt = Date.now();

    // Formato: tipo-uuid-timestamp-expiry
    return `${type}-${crypto.randomUUID()}-${createdAt}-${expiresAt}`;
  }

  // Validar y parsear token
  parseToken(token: string): ServiceResult<TokenData> {
    try {
      console.log("🔍 TokenService.parseToken - token:", token);

      const parts = token.split("-");
      console.log("🔍 TokenService.parseToken - parts:", parts);

      if (parts.length < 4) {
        console.log(
          "❌ TokenService.parseToken - parts insuficientes:",
          parts.length
        );
        return createError({
          name: "ValidationError",
          message: "Formato de token inválido",
          code: "INVALID_TOKEN_FORMAT",
        });
      }

      const type = parts[0];
      const createdAt = parseInt(parts[parts.length - 2]);
      const expiresAt = parseInt(parts[parts.length - 1]);

      // ✅ Reconstruir entityId correctamente
      const entityId = parts.slice(1, -2).join("-");

      console.log("🔍 TokenService.parseToken - type:", type);
      console.log("🔍 TokenService.parseToken - entityId:", entityId);
      console.log("🔍 TokenService.parseToken - createdAt:", createdAt);
      console.log("🔍 TokenService.parseToken - expiresAt:", expiresAt);
      console.log("🔍 TokenService.parseToken - now:", Date.now());

      if (!type || !entityId || isNaN(createdAt) || isNaN(expiresAt)) {
        console.log("❌ TokenService.parseToken - datos malformados");
        return createError({
          name: "ValidationError",
          message: "Token malformado",
          code: "MALFORMED_TOKEN",
        });
      }

      if (Date.now() > expiresAt) {
        console.log("❌ TokenService.parseToken - token expirado");
        return createError({
          name: "ValidationError",
          message: "Token expirado",
          code: "EXPIRED_TOKEN",
        });
      }

      console.log("✅ TokenService.parseToken - token válido");
      return createSuccess({
        entityId,
        type: type as TokenType,
        expiresAt,
        createdAt,
      });
    } catch (error) {
      console.log("❌ TokenService.parseToken - error:", error);
      return createError({
        name: "ValidationError",
        message: "Error procesando token",
        code: "TOKEN_PARSE_ERROR",
        details: error,
      });
    }
  }
}

export const tokenService = new TokenService();
