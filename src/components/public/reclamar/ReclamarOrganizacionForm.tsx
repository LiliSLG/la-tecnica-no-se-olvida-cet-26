// src/components/public/reclamar/ReclamarOrganizacionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  AlertTriangle,
  Building,
  Chrome,
  UserPlus,
} from "lucide-react";
import { z } from "zod";

interface ReclamarOrganizacionFormProps {
  organizacion: OrganizacionRow;
  token: string;
}

// Tipos de registro
type TipoRegistro = "google" | "manual";

// Schema de validación para registro manual
const registroManualSchema = z
  .object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    telefono: z.string().optional(),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    confirmaRepresentacion: z.boolean().refine((val) => val === true, {
      message: "Debes confirmar que representas a la organización",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegistroManualData = z.infer<typeof registroManualSchema>;

export function ReclamarOrganizacionForm({
  organizacion,
  token,
}: ReclamarOrganizacionFormProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>("manual");
  const [procesando, setProcesando] = useState(false);
  const [verificacionExitosa, setVerificacionExitosa] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Estados del formulario manual
  const [formData, setFormData] = useState<RegistroManualData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    confirmaRepresentacion: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegistroManualData, string>>
  >({});

  // Timeout para authLoading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setAuthTimeout(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Validar campo individual
  const validateField = (
    field: keyof RegistroManualData,
    value: string | boolean
  ) => {
    try {
      if (field === "confirmPassword") {
        if (value !== formData.password) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Las contraseñas no coinciden",
          }));
        } else {
          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        }
      } else if (field === "confirmaRepresentacion") {
        if (!value) {
          setErrors((prev) => ({
            ...prev,
            confirmaRepresentacion:
              "Debes confirmar que representas a la organización",
          }));
        } else {
          setErrors((prev) => ({ ...prev, confirmaRepresentacion: undefined }));
        }
      } else if (field === "password" && typeof value === "string") {
        if (value.length < 6) {
          setErrors((prev) => ({
            ...prev,
            password: "La contraseña debe tener al menos 6 caracteres",
          }));
        } else {
          setErrors((prev) => ({ ...prev, password: undefined }));
        }
      } else if (field === "email" && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setErrors((prev) => ({ ...prev, email: "Email inválido" }));
        } else {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
      } else if (
        (field === "nombre" || field === "apellido") &&
        typeof value === "string"
      ) {
        if (value.length < 2) {
          setErrors((prev) => ({
            ...prev,
            [field]: `${
              field === "nombre" ? "El nombre" : "El apellido"
            } debe tener al menos 2 caracteres`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      }
    } catch (error) {
      console.error("Error validating field:", error);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (
    field: keyof RegistroManualData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Registro con Google (placeholder)
  const handleRegistroGoogle = async () => {
    console.log("🔍 Registro con Google - TODO: Implementar OAuth");
    setProcesando(true);

    try {
      // TODO: Implementar OAuth con Google
      toast({
        title: "Próximamente",
        description:
          "La integración con Google estará disponible pronto. Por ahora usa registro manual.",
        variant: "default",
      });
    } finally {
      setProcesando(false);
    }
  };

  // Registro manual
  const handleRegistroManual = async () => {
    console.log("🔍 handleRegistroManual - INICIANDO");
    console.log("🔍 formData actual:", formData);

    // Validar formulario completo
    try {
      registroManualSchema.parse(formData);
      console.log("✅ Schema válido");
    } catch (error) {
      console.log("❌ Error en schema:", error);
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RegistroManualData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RegistroManualData] = err.message;
          }
        });
        console.log("🔍 Errores encontrados:", newErrors);
        setErrors(newErrors);
        return;
      }
    }

    console.log("🔍 Iniciando verificación con cuenta personal...");
    setProcesando(true);

    try {
      console.log("🔍 Llamando a verificarConCuentaPersonal...");
      // TODO: Crear método verificarConCuentaPersonal en organizacionesService
      const result = await organizacionesService.verificarConCuentaPersonal(
        token,
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
        }
      );

      console.log("🔍 Resultado:", result);

      if (result.success) {
        setVerificacionExitosa(true);
        toast({
          title: "¡Verificación Completada!",
          description: `¡Bienvenido/a! ${organizacion.nombre_oficial} ha sido verificada y vinculada a tu cuenta.`,
        });

        // Redirect después de 3 segundos al dashboard organizacional
        setTimeout(() => {
          router.push("/dashboard/organizaciones"); 
        }, 3000);
      } else {
        toast({
          title: "Error en la verificación",
          description:
            result.error?.message || "No se pudo completar la verificación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en verificación:", error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al procesar la verificación",
        variant: "destructive",
      });
    } finally {
      setProcesando(false);
    }
  };

  // Estado de éxito
  if (verificacionExitosa) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              ¡Verificación Completada!
            </h3>
            <p className="text-green-600 mb-4">
              Tu cuenta ha sido creada y{" "}
              <strong>{organizacion.nombre_oficial}</strong> ha sido verificada
              y vinculada a tu perfil.
            </p>
            <p className="text-sm text-muted-foreground">
              Serás redirigido al dashboard organizacional...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state con timeout
  if (authLoading && !authTimeout) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
          <div className="mt-4">
            <button
              onClick={() => setAuthTimeout(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              Continuar sin esperar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si ya está logueado, mostrar opción de reclamar con cuenta existente
  if (user && !authTimeout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Ya tienes una cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Cuenta actual:</strong>{" "}
              {user?.email || "Usuario logueado"}
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>
                ¿Quieres verificar la organización con esta cuenta?
              </strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Se vinculará {organizacion.nombre_oficial} a tu cuenta actual
              </li>
              <li>Podrás gestionar la organización desde tu dashboard</li>
              <li>La organización aparecerá como "Verificada" públicamente</li>
            </ul>
          </div>

          <Button
            onClick={async () => {
              setProcesando(true);
              try {
                // TODO: Método para vincular organización a cuenta existente
                const result =
                  await organizacionesService.vincularOrganizacionAUsuario(
                    token,
                    user.id
                  );
                if (result.success) {
                  toast({
                    title: "¡Organización Vinculada!",
                    description: `${organizacion.nombre_oficial} ha sido vinculada a tu cuenta.`,
                  });
                  router.push("/dashboard/organizaciones"); 
                } else {
                  toast({
                    title: "Error en la vinculación",
                    description:
                      result.error?.message ||
                      "No se pudo vincular la organización",
                    variant: "destructive",
                  });
                }
              } finally {
                setProcesando(false);
              }
            }}
            disabled={procesando}
            className="w-full"
            size="lg"
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Vinculando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verificar con mi cuenta actual
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                // Logout y recargar
                window.location.href =
                  "/logout?redirect=" +
                  encodeURIComponent(window.location.pathname);
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              O crear una cuenta nueva
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formulario principal
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Crear Cuenta y Verificar {organizacion.nombre_oficial}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info de la organización */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vas a crear tu cuenta personal y verificar{" "}
            <strong>{organizacion.nombre_oficial}</strong> al mismo tiempo.
            Después podrás gestionar la organización desde tu dashboard.
          </AlertDescription>
        </Alert>

        {/* Selector de tipo de registro */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            ¿Cómo prefieres crear tu cuenta?
          </Label>

          <RadioGroup
            value={tipoRegistro}
            onValueChange={(value) => setTipoRegistro(value as TipoRegistro)}
            className="grid grid-cols-1 gap-4"
          >
            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="google" id="google" />
              <Label
                htmlFor="google"
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <Chrome className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Continuar con Google</div>
                  <div className="text-sm text-muted-foreground">
                    Rápido y seguro
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="manual" id="manual" />
              <Label
                htmlFor="manual"
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <UserPlus className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Crear cuenta manual</div>
                  <div className="text-sm text-muted-foreground">
                    Completar formulario
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Formulario según tipo seleccionado */}
        {tipoRegistro === "google" ? (
          // Sección Google OAuth
          <div className="space-y-4 text-center">
            <div className="p-6 rounded-lg border-2 border-dashed border-muted">
              <Chrome className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Registro con Google</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Se abrirá una ventana de Google para que inicies sesión de forma
                segura.
              </p>

              <Button
                onClick={handleRegistroGoogle}
                disabled={procesando}
                size="lg"
                className="w-full"
              >
                {procesando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando con Google...
                  </>
                ) : (
                  <>
                    <Chrome className="h-4 w-4 mr-2" />
                    Continuar con Google
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Formulario manual
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Nombre *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    placeholder="Tu nombre"
                    className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Apellido *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.apellido}
                    onChange={(e) =>
                      handleInputChange("apellido", e.target.value)
                    }
                    placeholder="Tu apellido"
                    className={`pl-10 ${
                      errors.apellido ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="tu@email.com"
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Teléfono (opcional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.telefono}
                    onChange={(e) =>
                      handleInputChange("telefono", e.target.value)
                    }
                    placeholder="+54 9 11 1234-5678"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                    className={`pl-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Confirmar Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Repetir contraseña"
                    className={`pl-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Confirmación */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirma"
                  checked={formData.confirmaRepresentacion}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "confirmaRepresentacion",
                      checked === true
                    )
                  }
                />
                <Label htmlFor="confirma" className="text-sm leading-relaxed">
                  Confirmo que tengo autoridad para representar oficialmente a{" "}
                  <strong>{organizacion.nombre_oficial}</strong> y acepto los
                  términos de uso de la plataforma.
                </Label>
              </div>
              {errors.confirmaRepresentacion && (
                <p className="text-red-500 text-xs">
                  {errors.confirmaRepresentacion}
                </p>
              )}
            </div>

            {/* Botón de acción */}
            <Button
              onClick={handleRegistroManual}
              disabled={procesando}
              className="w-full"
              size="lg"
            >
              {procesando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando cuenta y verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Crear Cuenta y Verificar Organización
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info adicional */}
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>¿Qué sucede después?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Se crea tu cuenta personal en La Técnica no se Olvida</li>
            <li>
              {organizacion.nombre_oficial} quedará verificada y vinculada a tu
              cuenta
            </li>
            <li>
              Podrás gestionar tanto tu perfil personal como el de la
              organización
            </li>
            <li>Tendrás acceso al dashboard organizacional completo</li>
            <li>
              Podrás invitar otros miembros de la organización más adelante
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
