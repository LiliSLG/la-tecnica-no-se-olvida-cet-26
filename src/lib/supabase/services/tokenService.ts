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
  // 🔧 CAMBIAR línea 25 en /src/lib/supabase/services/tokenService.ts:

  generateToken(
    entityId: string,
    type: TokenType,
    expiryDays: number = 30
  ): string {
    const expiresAt = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    const createdAt = Date.now();

    return `${type}-${entityId}-${createdAt}-${expiresAt}`;
  }

  // Validar y parsear token
  parseToken(token: string): ServiceResult<TokenData> {
    try {
      const parts = token.split("-");

      if (parts.length < 7) {
        // ✅ UUID tiene 5 partes + tipo + timestamps = 7 mínimo
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

      const entityId = parts.slice(1, -2).join("-");

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
