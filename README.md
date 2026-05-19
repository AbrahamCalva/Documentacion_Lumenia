

# MANUAL DE USUARIO Y REFERENCIA TÉCNICA: SISTEMA FLDSMDFR

**Plataforma de Monitoreo Ambiental y Contaminación Lumínica "Lumenia"** **Desarrollado por:** Abraham Calva, Luis Fernando Gonzaga López, Gustavo López Paz y Brayan Martínez Hernández **Institución:** Instituto Tecnológico Superior del Occidente del Estado de Hidalgo (ITSOEH) **Fecha de Emisión:** 13 de abril de 2026 

---

## 1. Introducción y Propósito del Sistema

### 📢 Explicación Intuitiva (Para todo público)

El crecimiento de las ciudades ha provocado que usemos luz artificial de forma excesiva por las noches. Esto genera un fenómeno llamado *skyglow* (el resplandor o domo de luz gris/amarilla que cubre las ciudades e impide ver las estrellas). Este exceso de luz daña nuestra salud al alterar el ciclo natural del sueño (inhibe la melatonina) y afecta la fauna local.

El prototipo **FLDSMDFR** es una estación inteligente que mide con precisión matemática qué tan sobreiluminado está un lugar, relacionando la luz con las condiciones del clima y la contaminación del aire.

### 💻 Especificaciones de Ingeniería (Para Especialistas)

* 
**Problema de estudio:** Cuantificación del impacto de la Iluminación Artificial Nocturna (ALAN) y su dispersión atmosférica por efecto Mie.


* 
**Enfoque del Proyecto:** Arquitectura IoT distribuida multimodal y escalable para la captura de series temporales de variables bioambientales.


* 
**Alineación Estratégica:** El sistema recopila datos empíricos de telemetría directamente vinculados con los Programas Nacionales Estratégicos (PRONACES) del CONAHCYT (Sustentabilidad Ambiental y Agentes Contaminantes), permitiendo auditar normativas de eficiencia energética como la **NOM-013-ENER-2013**.



---

## 2. Arquitectura de Hardware (Módulo de Adquisición)

El dispositivo físico se compone de dos bloques principales encerrados en carcasas personalizadas fabricadas mediante impresión 3D para su protección en campo.

### 🛠️ Tabla de Componentes e Instrumentación

| Componente / Sensor | ¿Qué hace? (Nivel General) | Especificación Técnica (Nivel Especialista) |
| --- | --- | --- |
| <br>**Heltec WiFi LoRa 32 V2** 

 | Es el "cerebro" y el radio del dispositivo.

 | Microcontrolador basado en ESP32 con transceptor LoRa SX1276/78 integrado. Operación de ultra bajo consumo.

 |
| <br>**TSL2591** 

 | Mide la luz ambiental.

 | Sensor de Iluminancia de Alto Rango Dinámico (HDR) con sensibilidad extrema de hasta 188 microluxes, ideal para medir cielos nocturnos oscuros.

 |
| <br>**BMP280** 

 | Mide el clima (temperatura y presión).

 | Sensor barométrico digital conectado por bus I2C. Registra la estabilidad atmosférica que afecta el índice de refracción de la luz.

 |
| <br>**MQ-135** 

 | Mide la calidad del aire y gases contaminantes.

 | Sensor electroquímico para detectar CO2, benceno y partículas suspendidas que amplifican el domo de luz nocturno (*skyglow*).

 |
| <br>**Lilygo TTGO-T SIM7080G-S3** 

 | Actúa como un "puente" de comunicación hacia internet.

 | Tarjeta receptora/puente con módem celular que gestiona el protocolo MQTT hacia un broker en la nube (HiveMQ).

 |

---

## 3. Arquitectura de Red y Protocolos de Comunicación

### 📢 Explicación Intuitiva (Para todo público)

Los datos viajan en tres grandes etapas libres de cables:

1. 
**Del sensor al cerebro del nodo:** Los sensores platican con la tarjeta Heltec compartiendo una misma "línea telefónica" interna dentro del aparato.


2. 
**Del nodo al receptor (Gateway):** La estación envía los datos flotando por el aire a larga distancia usando ondas de radio de baja frecuencia (tecnología LoRa), llegando a una base central sin gastar apenas batería.


3. 
**De la base a la nube:** El receptor toma estos datos y los sube a Internet usando una tarjeta SIM celular o WiFi para que cualquiera pueda consultarlos desde una computadora.



```
[Sensores: TSL2591, BMP280, MQ-135] 
               [cite_start]│  (Protocolo I2C) [cite: 80]
               ▼
   [Nodo Emisor Heltec V2 (TX)] 
               [cite_start]│  (Transmisión Inalámbrica LoRa - 915 MHz) [cite: 426, 431]
               ▼
   [Nodo Receptor Heltec V2 (RX)] 
               [cite_start]│  (Comunicación Serial / Bridge) [cite: 254]
               ▼
   [Lilygo Bridge / Gateway IoT] 
               [cite_start]│  (Protocolo MQTT vía Internet Celular o WiFi) [cite: 77, 254, 708]
               ▼
   [cite_start][Broker HiveMQ] ──► [Node-RED] ──► [InfluxDB] ──► [Grafana (Dashboard)] [cite: 62, 63, 107]

```

### 💻 Especificaciones de Ingeniería (Para Especialistas)

El sistema implementa una pila de protocolos multi-capa optimizada para resiliencia energética y de transporte:

* 
**Capa de Enlace Local (Bus de Datos):** Interconexión sensor-MCU estructurada mediante protocolo **I2C**, compartiendo líneas SDA y SCL con asignación de direcciones de hardware independientes (ej. 0x23 para el bloque lumínico y 0x76/0x77 para el barométrico). Las líneas de datos se estabilizan mediante resistencias pull-up.


* 
**Capa Física Inalámbrica (LPWAN):** Transmisión de largo alcance (LoRa P2P) operando en la banda ISM de **915 MHz** (normativa para México). Se implementa una clave de acoplamiento por software (**Sync Word: 0x12**) para el aislamiento físico de tramas autorizadas.


* 
**Estructura y Transporte de Datos (Broker & Nube):** Los payloads se construyen localmente en cadenas delimitadas por comas (CSV) para reducir el overhead en la transmisión de radio , y el Gateway central los convierte en objetos estandarizados **JSON**. La carga de trabajo de red se delega a la tarjeta Lilygo, encargada de la publicación MQTT en el broker distribuido **HiveMQ**.


* 
**Mecanismo de Tolerancia a Fallos (Red Cableada de Emergencia):** En caso de saturación del espectro radioeléctrico o inhibición de señales aéreas, el prototipo integra una infraestructura cableada redundante de respaldo basada en el estándar **Ethernet IEEE 802.3** a través de switches de Capa 2, manteniendo las sesiones activas en el endpoint sin requerir reconfiguraciones lógicas.



---

## 4. Guía de Operación e Interfaces de Visualización

El usuario o administrador dispone de tres capas independientes para interactuar con la información capturada por el ecosistema Lumenia:

### 📱 Nivel 1: Diagnóstico Local In Situ (Pantalla OLED)

* 
**¿Para quién es?:** Para el técnico instalador en campo.


* 
**Funcionamiento:** Al energizarse el nodo emisor activando el pin de salida `Vext` , la pantalla OLED integrada en la tarjeta Heltec inicializa su buffer. Muestra de forma inmediata si los sensores responden adecuadamente ("OK") y despliega en tiempo real las lecturas en bruto de Luz, Temperatura y Presión.



### 💻 Nivel 2: Dashboard Web Embebido Local (Vía IP)

* 
**¿Para quién es?:** Para supervisores dentro de la misma infraestructura de red.


* 
**Funcionamiento:** El Gateway receptor levanta un servidor web asíncrono (`ESPAsyncWebServer`) en el puerto HTTP estándar. Al conectarse a la dirección IP del dispositivo (ej. `26.131.248.68:8080`) , se despliega una interfaz web interactiva y responsiva adaptada para móviles.


* 
**Mecánica de actualización:** Consume los datos transformados en JSON mediante llamadas repetitivas de la **API Fetch** de JavaScript programadas de manera fija cada 2 segundos, actualizando los contenedores visuales sin refrescar la página completa.



### 📊 Nivel 3: Panel Analítico Avanzado (Grafana e InfluxDB)

* 
**¿Para quién es?:** Para los especialistas del jurado y analistas ambientales.


* 
**Funcionamiento:** Representa la integración IoT completa. Los datos procesados a través de flujos en Node-RED se inyectan en un motor de base de datos de series temporales (**InfluxDB**).


* 
**Visualización Científica:** Mediante consultas con el lenguaje *Flux*, Grafana genera gráficos históricos masivos de correlación multidimensional (ej. cómo influyen 400 PPM de gas contaminante detectados en la dispersión de 100 lux de iluminación artificial pública nocturna).



---

## 5. Resumen de Operación y Control de Calidad de Servicio (QoS)

Para garantizar la confiabilidad del sistema ante el sínodo evaluador, se han integrado mecanismos automáticos de diagnóstico de red y salud de hardware:

> 💡 **Gestión Eficiente y Alertas (QoS):** El flujo de datos en el broker MQTT opera bajo políticas adaptables de Calidad de Servicio. Las variables de flujo constante y tendencias generales operan bajo **QoS 0** para optimizar el ancho de banda y prolongar la vida útil de las baterías de respaldo en los nodos. Los eventos críticos (como niveles críticos de contaminación ambiental o caídas de tensión energética por debajo de los 3.7V nominales en el circuito de alimentación) se elevan automáticamente a **QoS 1 o QoS 2**, garantizando la entrega de la alerta independientemente de las intermitencias de la red.
> 
>
