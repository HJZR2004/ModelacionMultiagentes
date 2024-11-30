# ModelacionMultiagentes


# Proceso de instalación

## Instalación de dependencias Flask y Mesa:
Moverse a la carpeta `\ModelacionMultiagentes\Server`, y correr:
```bash
pip install mesa==2.4.0 flask flask_cors
```

## Iniciar lógica de Mesa con API:
```bash
python server.py
```

## Visualización WebGL:
Moverse a la carpeta `\ModelacionMultiagentes\WebGL`, y correr:
```bash
npm install
```

### Iniciar Front de WebGL:
```bash
npx vite
```

---

# 1. Problema y propuesta de solución

## Problema:
El objetivo de la simulación es modelar el tráfico en una ciudad, considerando carreteras, semáforos, destinos y obstáculos. El problema radica en gestionar eficientemente el flujo vehicular para evitar congestiones y mejorar la movilidad.

## Propuesta de solución:
La solución consiste en diseñar una simulación en la que agentes (`Car`, `Traffic_Light`, `Destination`, `Road` y `Obstacle`) interactúan dentro de un grid, siguiendo reglas predefinidas como semáforos que cambian de estado y vehículos que buscan el camino más corto hacia su destino.

---

# 2. Diseño de los agentes

### **Car**
- **Objetivo**: Llegar a su destino recorriendo el camino más corto y evitando bloqueos.
- **Capacidad efectora**:
  - Movimiento dentro del grid siguiendo la ruta más eficiente.
  - Evita colisiones con otros vehículos y respeta el estado de los semáforos.
- **Percepción**:
  - Identifica carreteras, semáforos, obstáculos y su posición actual dentro del grid.
- **Proactividad**: Determina dinámicamente su ruta utilizando el algoritmo A*.
- **Métricas de desempeño**: Número de coches que alcanzan su destino.

### **Traffic_Light**
- **Objetivo**: Regular el flujo vehicular alternando entre rojo y verde.
- **Capacidad efectora**: Cambia su estado cada cierto número de pasos.
- **Percepción**: No tiene percepción activa, pero afecta al flujo de los coches.
- **Proactividad**: Cambia su estado basado en el tiempo definido.
- **Métricas de desempeño**: No aplica.

### **Destination**
- **Objetivo**: Actuar como punto final para los coches.
- **Capacidad efectora**: No aplica, ya que es un objetivo estático.
- **Percepción**: No tiene percepción ni interacción con otros agentes.
- **Proactividad**: No aplica.
- **Métricas de desempeño**: No aplica.

### **Obstacle**
- **Objetivo**: Representar elementos que bloquean el paso.
- **Capacidad efectora**: No tiene capacidades efectoras, ya que es un objeto estático.
- **Percepción**: No tiene percepción ni interacción con otros agentes.
- **Proactividad**: No aplica.
- **Métricas de desempeño**: No aplica.

### **Road**
- **Objetivo**: Determinar los caminos disponibles y sus direcciones.
- **Capacidad efectora**: Define la dirección permitida para los coches en cada celda.
- **Percepción**: No tiene percepción activa.
- **Proactividad**: No aplica.
- **Métricas de desempeño**: No aplica.

---

# 3. Arquitectura de subsunción de los agentes

### **Explorar**:
- **Condición**: Cuando no hay bloqueos ni semáforos en rojo en el camino.
- **Acción**: Avanzar hacia el destino siguiendo la ruta más corta.

### **Esperar en semáforo**:
- **Condición**: Encontrar un semáforo en rojo.
- **Acción**: Permanecer en la celda actual hasta que el semáforo cambie.

### **Evitar colisiones**:
- **Condición**: Detectar otro carro en la celda destino inmediata.
- **Acción**: Reevaluar la ruta o esperar hasta que la celda esté libre.

### **Finalizar viaje**:
- **Condición**: Al alcanzar la celda destino o una celda vecina válida.
- **Acción**: Detenerse, retirarse del grid y ser eliminado del modelo.

---

# 4. Características del ambiente

- **No determinístico**:
  - Las rutas de los coches se recalculan dinámicamente utilizando el algoritmo A*. Además, los semáforos cambian de estado siguiendo intervalos predefinidos, lo que introduce incertidumbre en el flujo vehicular.

- **Accesible**:
  - El ambiente es parcialmente accesible porque los coches solo perciben celdas adyacentes en su entorno inmediato. Esto incluye información sobre carreteras, semáforos, obstáculos y otros coches dentro de esa vecindad limitada.

- **No episódico**:
  - Las acciones actuales de los agentes, como elegir una ruta o esperar en un semáforo, afectan estados futuros. Por ejemplo, tomar un desvío puede evitar tráfico más adelante, pero también podría retrasar la llegada al destino.

- **Dinámico**:
  - El ambiente cambia constantemente. Los coches se mueven hacia sus destinos, los semáforos alternan entre verde y rojo, y la presencia de coches en diferentes celdas puede generar bloqueos o afectar las rutas disponibles.

- **Discreto**:
  - El entorno está modelado como un grid de celdas, donde cada celda puede contener un agente (carro, semáforo, destino, obstáculo o carretera) y los agentes solo se mueven entre celdas definidas.

---

# 5. Estadísticas recolectadas en las simulaciones

La simulación recolecta:
- Número de coches que llegaron a su destino.
- Total de coches activos en el grid.

---

# 6. Conclusiones

La simulación de tráfico es una herramienta útil para entender cómo se comporta el tráfico en una ciudad y probar diferentes formas de mejorar la movilidad. Permite observar cómo interactúan los coches, semáforos, carreteras y obstáculos, y cómo estas interacciones afectan el flujo vehicular y la congestión en diferentes áreas.

Una de las fortalezas del modelo es que los coches pueden encontrar rutas eficientes hacia sus destinos utilizando el algoritmo A*. Esto podría reflejar el funcionamiento de sistemas de navegación modernos. Además, los semáforos ayudan a regular el tráfico y permiten probar distintos tiempos de cambio para encontrar configuraciones que mejoren la fluidez del tránsito.

Aunque hay ciertos detalles que podrían volver más realista o eficiente la simulación, en este reto los vehículos solo ven las celdas que están a su alrededor inmediato. Si pudieran "ver" más lejos, podrían anticipar problemas y tomar mejores decisiones.

En general, esta simulación podría ser una buena herramienta para planificar y mejorar el transporte en las ciudades.
