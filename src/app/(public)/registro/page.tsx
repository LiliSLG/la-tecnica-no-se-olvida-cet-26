// src/app/(public)/registro/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/supabase/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Handshake,
  Info,
  ArrowLeft,
  Loader2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

// Schema de validación
const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  esAlumnoCET: z.boolean(),
  quiereColaborar: z.boolean(),
});

type RegistroData = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState<RegistroData>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    esAlumnoCET: false,
    quiereColaborar: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegistroData, string>>
  >({});
  const [procesando, setProcesando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [colaboracionExpandida, setColaboracionExpandida] = useState(false);

  // Validar campo individual
  const validateField = (
    field: keyof RegistroData,
    value: string | boolean
  ) => {
    try {
      if (
        (field === "nombre" || field === "apellido") &&
        typeof value === "string"
      ) {
        const fieldName = field === "nombre" ? "El nombre" : "El apellido";
        if (value.length < 2) {
          setErrors((prev) => ({
            ...prev,
            [field]: `${fieldName} debe tener al menos 2 caracteres`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      } else if (field === "email" && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setErrors((prev) => ({ ...prev, email: "Email inválido" }));
        } else {
          setErrors((prev) => ({ ...prev, email: undefined }));
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
      }
    } catch (error) {
      console.error("Error validating field:", error);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (
    field: keyof RegistroData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") {
      validateField(field, value);
    }
  };

  // Limpiar quiereColaborar si selecciona que es alumno CET
  const handleEsAlumnoChange = (esAlumno: boolean) => {
    setFormData((prev) => ({
      ...prev,
      esAlumnoCET: esAlumno,
      quiereColaborar: esAlumno ? false : prev.quiereColaborar, // Reset colaborar si es alumno
    }));
    if (esAlumno) {
      setColaboracionExpandida(false); // Cerrar sección colaboración
    }
  };

  // Determinar categoría según las respuestas
  const determinarCategoria = () => {
    // SIEMPRE comunidad_general para registros públicos
    return "comunidad_general";
  };

  // Determinar estado de verificación
  const determinarEstadoVerificacion = () => {
    // Usuario se registró él mismo → SIEMPRE verificado
    return "verificada";
  };

  // Determinar tipo de solicitud
  const determinarTipoSolicitud = (
    esAlumno: boolean,
    quiereColaborar: boolean
  ) => {
    if (esAlumno) {
      return "cambio_categoria"; // Admin debe definir si es estudiante_cet o ex_alumno_cet
    }
    if (quiereColaborar) {
      return "cambio_categoria"; // Solicita cambio a comunidad_activa
    }
    return null; // Usuario básico sin solicitudes
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todo el formulario
    try {
      registroSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RegistroData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RegistroData] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setProcesando(true);

    try {
      console.log("🔍 Iniciando registro público:", formData);

      // Determinar campos automáticos
      const categoria = determinarCategoria();
      const estadoVerificacion = determinarEstadoVerificacion();
      const tipoSolicitud = determinarTipoSolicitud(
        formData.esAlumnoCET,
        formData.quiereColaborar
      );

      // Crear cuenta con authService
      const result = await authService.signUp(
        formData.email,
        formData.password,
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          categoria_principal: categoria,
          es_ex_alumno_cet: formData.esAlumnoCET,
          estado_verificacion: estadoVerificacion,
          tipo_solicitud: tipoSolicitud,
          disponible_para_proyectos: formData.quiereColaborar, // Solo si NO es alumno y quiere colaborar
        }
      );

      if (result.success) {
        console.log("✅ Registro exitoso");

        if (formData.esAlumnoCET) {
          toast({
            title: "¡Registro exitoso!",
            description:
              "Bienvenido/a al CET! Nuestro equipo verificará tu perfil académico.",
          });
        } else if (formData.quiereColaborar) {
          toast({
            title: "¡Registro exitoso!",
            description:
              "Tu solicitud de colaboración será revisada. Podrás completar tu perfil una vez aprobada.",
          });
        } else {
          toast({
            title: "¡Bienvenido/a!",
            description: "Tu cuenta ha sido creada exitosamente.",
          });
        }

        // Siempre redirigir a home
        router.push("/");
      } else {
        console.error("❌ Error en registro:", result.error);

        if (result.error?.code === "USER_EXISTS") {
          setErrors({ email: "Este email ya está registrado" });
        } else {
          toast({
            title: "Error en el registro",
            description:
              result.error?.message ||
              "No se pudo crear la cuenta. Intenta nuevamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Únete a Nuestra Comunidad
            </h1>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>CET N°26 - Ingeniero Jacobacci</span>
            </div>
            <p className="text-muted-foreground">
              Crea tu cuenta y forma parte de la comunidad educativa
            </p>
          </div>
        </div>

        {/* Formulario Principal */}
        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Crear Cuenta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Completa los datos básicos para formar parte de nuestra comunidad
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) =>
                        handleInputChange("nombre", e.target.value)
                      }
                      placeholder="Tu nombre"
                      className="pl-9"
                      disabled={procesando}
                    />
                  </div>
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="apellido"
                      type="text"
                      required
                      value={formData.apellido}
                      onChange={(e) =>
                        handleInputChange("apellido", e.target.value)
                      }
                      placeholder="Tu apellido"
                      className="pl-9"
                      disabled={procesando}
                    />
                  </div>
                  {errors.apellido && (
                    <p className="text-sm text-red-500">{errors.apellido}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-9"
                    disabled={procesando}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9 pr-9"
                    disabled={procesando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    disabled={procesando}
                  >
                    {mostrarPassword ? "👁️" : "👁️‍🗨️"}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Pregunta CET */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  ¿Eres alumno o ex-alumno del CET N°26?
                </Label>
                <RadioGroup
                  value={formData.esAlumnoCET ? "si" : "no"}
                  onValueChange={(value) =>
                    handleEsAlumnoChange(value === "si")
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cet-si" />
                    <Label htmlFor="cet-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cet-no" />
                    <Label htmlFor="cet-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Sección Colaboración Expandible - Solo si NO es alumno CET */}
              {!formData.esAlumnoCET && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setColaboracionExpandida(!colaboracionExpandida)
                    }
                    className="w-full flex items-center justify-between p-4 h-auto"
                    disabled={procesando}
                  >
                    <div className="flex items-center gap-2">
                      <Handshake className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        ¿Te interesa colaborar? (Opcional)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.quiereColaborar && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Habilitado
                        </span>
                      )}
                      <span className="text-sm">
                        {colaboracionExpandida ? "⬆️" : "⬇️"}
                      </span>
                    </div>
                  </Button>

                  {colaboracionExpandida && (
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="colaborar"
                          checked={formData.quiereColaborar}
                          onCheckedChange={(checked) =>
                            handleInputChange("quiereColaborar", !!checked)
                          }
                          disabled={procesando}
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="colaborar"
                            className="cursor-pointer font-medium"
                          >
                            Sí, quiero que estudiantes puedan contactarme para
                            sus proyectos
                          </Label>
                        </div>
                      </div>

                      {/* Explicación */}
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Si marcas esta opción:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li>
                              Los estudiantes podrán invitarte a participar en
                              sus proyectos
                            </li>
                            <li>
                              Podrás agregar información sobre tus
                              conocimientos, experiencia y establecimiento rural
                            </li>
                            <li>
                              Es completamente opcional y puedes cambiar tu
                              decisión después
                            </li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje para alumnos CET */}
              {formData.esAlumnoCET && (
                <Alert className="border-green-200 bg-green-50">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡Genial que seas parte del CET!</strong> Nuestro
                    equipo revisará tu perfil para definir si eres estudiante
                    actual o ex-alumno. Después podrás completar tu información
                    académica.
                  </AlertDescription>
                </Alert>
              )}

              {/* Botón Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={procesando}
                size="lg"
              >
                {procesando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            {/* Footer del formulario */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Al crear una cuenta, aceptas formar parte de la comunidad educativa
            del CET N°26
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 CET N°26 - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
