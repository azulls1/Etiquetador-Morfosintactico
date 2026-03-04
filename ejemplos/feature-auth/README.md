# Ejemplo: Feature - Autenticacion con Google

> **Escala:** Feature (1-8 horas)
> **Agentes involucrados:** nxt-analyst, nxt-pm, nxt-architect, nxt-dev, nxt-qa, nxt-docs
> **Tiempo total:** ~4 horas

---

## Escenario

El Product Owner solicita agregar "Login con Google" a la aplicacion existente que solo tiene login con email/password.

## Paso 1: Solicitud Inicial

```
Necesitamos agregar login con Google a nuestra app.
Actualmente solo tenemos login con email y password.
Los usuarios piden poder entrar mas rapido.
```

## Paso 2: Activar Orquestador

```
/nxt/orchestrator
```

**Respuesta:**

```
## Clasificacion de Tarea

**Escala detectada:** Feature
**Razon:** Nueva funcionalidad de autenticacion
**Agentes asignados:** analyst, pm, architect, dev, qa, docs

### Workflow
[ANALYST] -> [PM] -> [ARCHITECT] -> [DEV] -> [QA] -> [DOCS]

Iniciando con analisis...
```

## Paso 3: Analisis (nxt-analyst)

```
/nxt/analyst
```

**Output del analista:**

### Investigacion de Mercado
- 65% de apps modernas ofrecen login social
- Google es el proveedor #1 (78% de uso)
- Reduce friccion de registro en 40%

### Requisitos Identificados
1. Boton "Continuar con Google" en pagina de login
2. Vincular cuenta Google con cuenta existente
3. Crear cuenta nueva si no existe
4. Mantener compatibilidad con login actual

### Riesgos
- Dependencia de Google OAuth
- Manejo de cuentas duplicadas

## Paso 4: Definicion (nxt-pm)

```
/nxt/pm
```

**User Story generada:**

```markdown
# STORY-042: Login con Google

## Historia
COMO usuario de la aplicacion
QUIERO poder iniciar sesion con mi cuenta de Google
PARA acceder mas rapido sin recordar otra contraseña

## Criterios de Aceptacion

### Escenario 1: Login exitoso con Google
DADO que estoy en la pagina de login
CUANDO hago click en "Continuar con Google"
Y selecciono mi cuenta de Google
ENTONCES inicio sesion en la aplicacion

### Escenario 2: Primera vez con Google
DADO que no tengo cuenta en la app
CUANDO hago login con Google por primera vez
ENTONCES se crea una cuenta con mis datos de Google

### Escenario 3: Email ya existe
DADO que ya tengo cuenta con mi email de Google
CUANDO hago login con Google
ENTONCES se vincula mi cuenta de Google a mi cuenta existente

## Estimacion
- Story Points: 5
- Complejidad: Media
```

## Paso 5: Arquitectura (nxt-architect)

```
/nxt/architect
```

**Decision de arquitectura:**

```
┌─────────────────┐
│    Frontend     │
│  (Login Page)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Google OAuth  │────>│   Google API    │
│    Button       │<────│   (tokens)      │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│    Backend      │
│  /auth/google   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │
│  users.google_id│
└─────────────────┘
```

**Stack elegido:**
- Frontend: `@react-oauth/google`
- Backend: `passport-google-oauth20`
- DB: Nueva columna `google_id` en tabla `users`

## Paso 6: Implementacion (nxt-dev)

```
/nxt/dev
```

### 6.1 Migracion de Base de Datos

```sql
-- migrations/add_google_auth.sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

### 6.2 Backend - Endpoint

```typescript
// src/routes/auth.ts
router.post('/auth/google', async (req, res) => {
  const { credential } = req.body;

  // Verificar token con Google
  const payload = await verifyGoogleToken(credential);

  // Buscar o crear usuario
  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      email: payload.email,
      name: payload.name,
      google_id: payload.sub,
      avatar_url: payload.picture
    });
  } else if (!user.google_id) {
    user.google_id = payload.sub;
    await user.save();
  }

  // Generar JWT
  const token = generateJWT(user);
  res.json({ token, user });
});
```

### 6.3 Frontend - Boton

```tsx
// src/components/GoogleLoginButton.tsx
import { GoogleLogin } from '@react-oauth/google';

export function GoogleLoginButton() {
  const handleSuccess = async (response) => {
    const { data } = await api.post('/auth/google', {
      credential: response.credential
    });
    login(data.token, data.user);
    navigate('/dashboard');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error('Error al conectar con Google')}
    />
  );
}
```

### 6.4 Integracion en Login Page

```tsx
// src/pages/Login.tsx
<div className="login-form">
  <h1>Iniciar Sesion</h1>

  {/* Login tradicional */}
  <EmailPasswordForm />

  <div className="divider">o</div>

  {/* Login con Google */}
  <GoogleLoginButton />
</div>
```

## Paso 7: Testing (nxt-qa)

```
/nxt/qa
```

### Tests Unitarios

```typescript
// tests/auth.test.ts
describe('Google Auth', () => {
  it('should create new user on first Google login', async () => {
    const response = await request(app)
      .post('/auth/google')
      .send({ credential: mockGoogleToken });

    expect(response.status).toBe(200);
    expect(response.body.user.google_id).toBeDefined();
  });

  it('should link Google to existing account', async () => {
    // Crear usuario con email
    await User.create({ email: 'test@gmail.com', password_hash: 'xxx' });

    const response = await request(app)
      .post('/auth/google')
      .send({ credential: mockGoogleToken });

    expect(response.status).toBe(200);
    const user = await User.findOne({ email: 'test@gmail.com' });
    expect(user.google_id).toBeDefined();
  });
});
```

### QA Report

| Test | Resultado |
|------|-----------|
| Login nuevo usuario | PASS |
| Vincular cuenta existente | PASS |
| Token invalido | PASS (error manejado) |
| UI en mobile | PASS |
| UI en desktop | PASS |

## Paso 8: Documentacion (nxt-docs)

```
/nxt/docs
```

**Documentacion generada:**

```markdown
# Autenticacion con Google

## Configuracion

1. Crear proyecto en Google Cloud Console
2. Habilitar Google OAuth API
3. Configurar credenciales OAuth 2.0
4. Agregar variables de entorno:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Uso

El boton de Google aparece automaticamente en /login.
Los usuarios pueden:
- Crear cuenta nueva con Google
- Vincular Google a cuenta existente
- Login rapido si ya tienen Google vinculado
```

## Paso 9: Commit y PR

```bash
git add .
git commit -m "feat: Agregar login con Google OAuth

- Nuevo endpoint POST /auth/google
- Componente GoogleLoginButton
- Migracion para google_id en users
- Tests unitarios y de integracion
- Documentacion de configuracion

Story: STORY-042"
```

## Resultado Final

| Metrica | Valor |
|---------|-------|
| Tiempo total | 3.5 horas |
| Archivos creados | 5 |
| Archivos modificados | 4 |
| Lineas de codigo | ~200 |
| Tests agregados | 8 |
| Cobertura | 85% |

---

## Comandos Usados en Orden

```
/nxt/orchestrator   # Clasifico y planifico
/nxt/analyst        # Investigo requisitos
/nxt/pm             # Creo user story
/nxt/architect      # Diseño solucion
/nxt/dev            # Implemento
/nxt/qa             # Valido
/nxt/docs           # Documento
```

## Estructura de Archivos Creados

```
src/
├── routes/
│   └── auth.ts              # Nuevo endpoint
├── components/
│   └── GoogleLoginButton.tsx # Nuevo componente
├── pages/
│   └── Login.tsx            # Modificado
migrations/
└── add_google_auth.sql      # Nueva migracion
tests/
└── auth.test.ts             # Nuevos tests
docs/
└── google-auth.md           # Nueva documentacion
```

---

*Ejemplo generado con NXT AI Development v3.6.0*
