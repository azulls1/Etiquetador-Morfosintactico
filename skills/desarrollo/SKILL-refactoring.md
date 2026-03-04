# SKILL: Refactoring (DEPRECATED)

> **DEPRECATED:** Este skill ha sido unificado.
> **Usar:** `skills/desarrollo/SKILL-code-quality.md` - Skill unificado Code Review + Refactoring

---

## Proposito (Legacy)
Ejecutar refactorizaciones seguras y sistematicas para mejorar la calidad
del codigo sin cambiar su comportamiento.

## Cuando se Activa
- Mejorar legibilidad del codigo
- Eliminar code smells
- Reducir deuda tecnica
- Preparar codigo para nuevas features
- Optimizar estructura

## Instrucciones

### 1. Principios de Refactoring

#### Regla de Oro
> "Refactoring es cambiar la estructura del codigo sin cambiar su comportamiento"

#### Pre-requisitos
- Tests existentes que pasen
- Commits pequenos y frecuentes
- Cambios reversibles

### 2. Code Smells Comunes

| Smell | Descripcion | Refactoring |
|-------|-------------|-------------|
| Long Method | Metodo > 20 lineas | Extract Method |
| Large Class | Clase con muchas responsabilidades | Extract Class |
| Duplicate Code | Codigo repetido | Extract Method/Class |
| Long Parameter List | > 3 parametros | Parameter Object |
| Feature Envy | Metodo usa mas datos de otra clase | Move Method |
| Data Clumps | Grupos de datos que viajan juntos | Extract Class |
| Primitive Obsession | Uso excesivo de primitivos | Value Object |
| Switch Statements | Switch largos | Strategy/Polymorphism |
| Speculative Generality | Codigo "por si acaso" | Remove Dead Code |
| Dead Code | Codigo no usado | Delete |

### 3. Catalogo de Refactorings

#### Extract Method
```javascript
// ANTES
function printOwing(invoice) {
  printBanner();

  // Print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${invoice.amount}`);
  console.log(`due: ${invoice.dueDate}`);
}

// DESPUES
function printOwing(invoice) {
  printBanner();
  printDetails(invoice);
}

function printDetails(invoice) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${invoice.amount}`);
  console.log(`due: ${invoice.dueDate}`);
}
```

#### Extract Variable
```javascript
// ANTES
if (
  platform.toUpperCase().includes('MAC') &&
  browser.toUpperCase().includes('SAFARI') &&
  wasInitialized() &&
  resize > 0
) {
  // ...
}

// DESPUES
const isMacSafari = platform.toUpperCase().includes('MAC') &&
                    browser.toUpperCase().includes('SAFARI');
const canResize = wasInitialized() && resize > 0;

if (isMacSafari && canResize) {
  // ...
}
```

#### Replace Conditional with Polymorphism
```javascript
// ANTES
function getSpeed(vehicle) {
  switch (vehicle.type) {
    case 'car':
      return vehicle.baseSpeed * 1.0;
    case 'motorcycle':
      return vehicle.baseSpeed * 1.2;
    case 'bicycle':
      return vehicle.baseSpeed * 0.5;
  }
}

// DESPUES
class Vehicle {
  getSpeed() {
    return this.baseSpeed;
  }
}

class Car extends Vehicle {
  getSpeed() {
    return this.baseSpeed * 1.0;
  }
}

class Motorcycle extends Vehicle {
  getSpeed() {
    return this.baseSpeed * 1.2;
  }
}
```

#### Introduce Parameter Object
```javascript
// ANTES
function amountInvoiced(startDate, endDate) { ... }
function amountReceived(startDate, endDate) { ... }
function amountOverdue(startDate, endDate) { ... }

// DESPUES
class DateRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

function amountInvoiced(dateRange) { ... }
function amountReceived(dateRange) { ... }
function amountOverdue(dateRange) { ... }
```

#### Replace Magic Numbers
```javascript
// ANTES
if (user.age >= 18) {
  // ...
}
const tax = price * 0.21;

// DESPUES
const LEGAL_AGE = 18;
const TAX_RATE = 0.21;

if (user.age >= LEGAL_AGE) {
  // ...
}
const tax = price * TAX_RATE;
```

#### Guard Clauses
```javascript
// ANTES
function getPayAmount() {
  let result;
  if (isDead) {
    result = deadAmount();
  } else {
    if (isSeparated) {
      result = separatedAmount();
    } else {
      if (isRetired) {
        result = retiredAmount();
      } else {
        result = normalPayAmount();
      }
    }
  }
  return result;
}

// DESPUES
function getPayAmount() {
  if (isDead) return deadAmount();
  if (isSeparated) return separatedAmount();
  if (isRetired) return retiredAmount();
  return normalPayAmount();
}
```

### 4. Workflow de Refactoring

```
1. Verificar tests existentes
   └── Si no hay tests → escribir tests primero

2. Identificar el smell
   └── Usar checklist de code smells

3. Seleccionar refactoring apropiado
   └── Consultar catalogo

4. Aplicar refactoring en pasos pequenos
   └── Commit despues de cada paso

5. Ejecutar tests
   └── Si fallan → revertir

6. Repetir hasta satisfaccion
```

### 5. Herramientas de Deteccion

```bash
# ESLint con reglas de complejidad
npx eslint --rule 'complexity: ["error", 10]' src/

# SonarQube CLI
sonar-scanner

# Code Climate
codeclimate analyze

# Metrics de complejidad
npx plato -r -d report src/
```

### 6. Metricas de Calidad

| Metrica | Bueno | Aceptable | Malo |
|---------|-------|-----------|------|
| Cyclomatic Complexity | 1-5 | 6-10 | > 10 |
| Lines per Function | < 20 | 20-50 | > 50 |
| Parameters | 0-3 | 4-5 | > 5 |
| Nesting Depth | 1-2 | 3 | > 3 |
| Class Lines | < 200 | 200-500 | > 500 |

### 7. Checklist Pre-Refactoring

- [ ] Tests existentes y pasando
- [ ] Branch de feature creado
- [ ] Scope del refactoring definido
- [ ] Comportamiento actual documentado
- [ ] Metricas baseline capturadas

### 8. Checklist Post-Refactoring

- [ ] Todos los tests pasan
- [ ] No hay regresiones
- [ ] Codigo mas legible
- [ ] Metricas mejoradas
- [ ] PR con descripcion clara

## Comandos de Ejemplo

```
"Refactoriza esta funcion para reducir complejidad"
"Extrae metodos de esta clase grande"
"Aplica guard clauses a estos condicionales"
"Elimina codigo duplicado entre estos archivos"
"Convierte estos switch a polimorfismo"
```

## Referencias

- Martin Fowler - "Refactoring: Improving the Design of Existing Code"
- https://refactoring.guru/refactoring/catalog
