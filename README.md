```markdown
# FLDSMDFR — Full Light Detection & Skyglow Monitoring: Dark-sky Field Research
## Plataforma Integrada de Monitoreo Ambiental y Contaminación Lumínica "Lumenia"

Este repositorio contiene la documentación de ingeniería, los códigos fuente completamente comentados, los esquemas de conexión eléctrica y los archivos de configuración de infraestructura necesarios para replicar de forma completa el prototipo **FLDSMDFR**. El sistema ha sido diseñado y desarrollado como el Proyecto Integrador del 6° Semestre de la carrera de Ingeniería en Tecnologías de la Información y Comunicaciones en el ITSOEH.

---

## 👥 Integrantes del Equipo
* **Calva Abraham** (Matrícula: 230110637)
* **Gonzaga López Luis Fernando** (Matrícula: 230110528)
* **López Paz Gustavo** (Matrícula: 230110531)
* **Martínez Hernández Brayan** (Matrícula: 230110578)

* **Catedrático Institucional:** Mtro. Saúl Isaí Soto Ortiz  
* **Periodo de Desarrollo:** Enero – Mayo 2026  
* **Ubicación de Origen:** Mixquiahuala de Juárez, Hidalgo, México

---

## 📌 Índice
1. [Introducción y Justificación del Proyecto](#1-introducción-y-justificación-del-proyecto)
2. [Objetivos del Sistema](#2-objetivos-del-sistema)
3. [Requerimientos de Hardware y Software](#3-requerimientos-de-hardware-y-software)
4. [Esquemas de Conexión Eléctrica (Pinouts)](#4-esquemas-de-conexión-eléctrica-pinouts)
5. [Matrices de Direccionamiento y Parámetros de Red](#5-matrices-de-direccionamiento-y-parámetros-de-red)
6. [Arquitectura del Sistema y Flujo de Datos](#6-arquitectura-del-sistema-y-flujo-de-datos)
7. [Firmware Comentado del Proyecto](#7-firmware-comentado-del-proyecto)
8. [Configuración del Backend e Infraestructura Docker](#8-configuración-del-backend-e-infraestructura-docker)
9. [Gestión Energética y Autonomía de Campo](#9-gestión-energética-y-autonomía-de-campo)
10. [Recomendaciones, Precauciones y Solución de Problemas](#10-recomendaciones-precauciones-y-solución-de-problemas)
11. [Guía de Replicación Paso a Paso](#11-guía-de-replicación-paso-a-paso)

---

## 1. Introducción y Justificación del Proyecto

La transición acelerada hacia entornos urbanos hiper-iluminados ha transformado la noche de un fenómeno natural en un producto de la ingeniería civil. La iluminación artificial nocturna (ALAN), cuando es gestionada de manera deficiente, da origen a la contaminación lumínica. Este es un problema ambiental de escala global que la International Dark-Sky Association (IDA) define como el uso inapropiado o excesivo de luz artificial, acarreando consecuencias críticas para la biodiversidad, la investigación científica astronómica, la salud visual y la estabilidad del ciclo circadiano humano debido a la supresión en la producción de melatonina.

Según los datos técnicos expuestos en el *"New World Atlas of Artificial Night Sky Brightness"*, más del 80% de la población mundial vive bajo cielos contaminados por luz, lo que impide de forma directa que un tercio de la humanidad pueda observar la Vía Láctea. 

En México, el crecimiento demográfico acelerado ha superado la capacidad de planeación urbana sostenible. El prototipo FLDSMDFR se alinea directamente con los Programas Nacionales Estratégicos (**PRONACES**) del CONAHCYT en los ejes prioritarios de Sustentabilidad Ambiental y Agentes Tóxicos y Procesos Contaminantes. Al proponer una infraestructura de monitoreo basada en el Internet de las Cosas (IoT) y la tecnología de radio de largo alcance LoRa, este proyecto busca cubrir la carencia actual de datos técnicos precisos y de bajo costo en los municipios e instituciones educativas, permitiendo evaluar el cumplimiento de normativas vigentes como la **NOM-013-ENER-2013** (Eficiencia energética para alumbrado en vialidades). El ecosistema convierte la percepción subjetiva de la sobreiluminación en datos cuantitativos y reproducibles.

---

## 2. Objetivos del Sistema

### 2.1 Objetivo General
Diseñar un sistema IoT para el monitoreo y análisis de la contaminación lumínica, mediante el uso de sensores de alta sensibilidad y tecnología de transmisión LoRa 915 MHz, con el fin de cuantificar el brillo del cielo nocturno (skyglow) y la eficiencia de la iluminación pública, generando datos en tiempo real visualizados en Grafana/Node-RED que fundamenten estrategias de sostenibilidad ambiental y preservación de la visibilidad astronómica en entornos urbanos e institucionales.

### 2.2 Objetivos Específicos
* **Configurar e implementar** nodos sensores basados en microcontroladores de alta eficiencia, integrando el sensor de iluminancia de alto rango dinámico TSL2591, el sensor barométrico BMP280 para variables atmosféricas y el sensor electroquímico MQ-135 para la identificación de agentes contaminantes dispersores de luz.
* **Implementar un protocolo de comunicación** inalámbrica robusto basado en tecnología LoRa que garantice la transmisión estable de datos en formato JSON desde los nodos periféricos hasta un Gateway centralizado.
* **Orquestar un ecosistema de datos** mediante contenedores Docker que integre Node-RED para la gestión del flujo de información, InfluxDB como motor de persistencia de series temporales y Grafana para el diseño de tableros analíticos interactivos.
* **Evaluar el desempeño operativo** del sistema FLDSMDFR en condiciones de campo reales, documentando el diseño en un repositorio público en GitHub para permitir su réplica absoluta por parte de terceros.

---

## 3. Requerimientos de Hardware y Software

### 3.1 Lista de Componentes de Hardware (BOM)
| Componente | Cantidad | Función Operativa | Notas Técnicas |
| :--- | :---: | :--- | :--- |
| **Heltec WiFi LoRa 32 V2** | 2 | Nodo emisor periférico y nodo receptor de radio. | System-on-Chip basado en ESP32 con chip de radio SX1276/78 integrado. |
| **Lilygo TTGO-T SIM7080G-S3** | 1 | Pasarela / Gateway de comunicación celular. | Actúa como Bridge de red transformando paquetes LoRa a MQTT via GPRS. |
| **Sensor TSL2591** | 1 | Módulo óptico de iluminancia de alta precisión. | Sucesor avanzado del GY-30/BH1750; posee sensibilidad extrema de hasta 188 microluxes. |
| **Sensor BMP280** | 1 | Medidor de presión atmosférica y temperatura. | Interfaz nativa de bus de datos I2C con operación fija a 3.3V. |
| **Sensor MQ-135** | 1 | Módulo de análisis de calidad del aire y gases. | Detecta PPM de CO2, amoníaco y benceno. Salida analógica integrada. |
| **Placa Perforada PCB** | 2 | Soporte y soldadura permanente del circuito. | Reemplaza la protoboard de pruebas para eliminar falsos contactos. |
| **Batería LiPo 3.7V** | 1–2 | Celda de alimentación móvil autónoma de campo. | Capacidad nominal recomendada entre 1000 y 3000 mAh con JST. |
| **Carcasa de Protección** | 2 | Encapsulado hermético con ranuras de ventilación. | Diseñada a medida e impresa en 3D en materiales PLA o PETG. |
| **Antena SMA de 915 MHz** | 2 | Antena acoplada para radiación RF en banda ISM. | Incluye antena celular LTE de banda ancha acoplada al Gateway Lilygo. |

### 3.2 Herramientas de Software Requeridas
* **Arduino IDE (Versión 2.x o superior):** Para el desarrollo, compilación y flasheo del firmware en las placas Heltec y Lilygo.
* **Docker Desktop (Versión 4.x o superior):** Para la inicialización y despliegue del stack unificado de persistencia y visualización de datos.
* **Node-RED (v3.x embebido en Docker):** Motor gráfico de orquestación encargado del consumo MQTT y conversión a base de datos.
* **InfluxDB (v2.x embebido en Docker):** Motor de base de datos relacional de series temporales enfocado en telemetría continua.
* **Grafana (v10.x embebido en Docker):** Entorno gráfico avanzado para el renderizado de instrumentos de aguja y gráficas de tendencias.
* **HiveMQ Cloud Broker (Free Tier):** Servidor MQTT en la nube utilizado para el enrutamiento y desacoplamiento de tramas JSON.

### 3.3 Librerías del Ecosistema Arduino
Es obligatorio instalar las siguientes extensiones mediante el Administrador de Librerías del IDE antes de compilar:
* `Heltec ESP32 Dev-Boards` (Paquete de soporte de tarjetas oficiales vía URL de preferencias).
* `Adafruit TSL2591 Library` (Controlador nativo del sensor de iluminancia HDR).
* `Adafruit BMP280 Library` (Gestor de lecturas barométricas e I2C).
* `ArduinoJson` por Benoit Blanchon (Serialización y estructuración de los objetos JSON).
* `ESPAsyncWebServer` + `AsyncTCP` (Mapeo de las llamadas asíncronas HTTP del panel de red local).

---

## 4. Esquemas de Conexión Eléctrica (Pinouts)

### 4.1 Conexión del Nodo Emisor (Heltec WiFi LoRa 32 V2)
El bloque de adquisición comparte las líneas de hardware del bus de comunicación I2C de la placa Heltec, habilitando el pin de control `Vext` como interruptor lógico de paso de energía para mitigar el consumo eléctrico.

| Sensor / Dispositivo Periférico | Pin Físico del Sensor | Pin Asignado Heltec V2 | Descripción de la Señal |
| :--- | :--- | :--- | :--- |
| **TSL2591 (Luz HDR)** | VCC <br> GND <br> SDA <br> SCL | 3.3V (Línea `Vext`) <br> GND <br> GPIO 4 <br> GPIO 15 | Alimentación conmutada (GPIO 21 = LOW activa). <br> Tierra común de referencia eléctrica. <br> Línea de datos del bus I2C (Pull-up interno activo). <br> Línea de reloj del bus I2C (Pull-up interno activo).|
| **BMP280 (Presión/Temp)** | VCC <br> GND <br> SDA <br> SCL | 3.3V (Línea `Vext`) <br> GND <br> GPIO 4 <br> GPIO 15 | Comparte la línea conmutada de energía del bus. <br> Referencia cero del circuito impreso. <br> Compartido en canal de datos I2C (Dirección 0x76). <br> Compartido en canal de sincronía de reloj. |
| **MQ-135 (Calidad de Aire)**| VCC <br> GND <br> AOUT <br> DOUT | 5V (Línea de Bus USB) <br> GND <br> GPIO 36 <br> GPIO 37 | Requiere voltaje alto para la celda térmica interna. <br> Tierra común de referencia eléctrica. <br> Salida analógica acoplada a canal ADC1_CH0. <br> Salida digital de umbral por hardware (Opcional). |

### 4.2 Conexión UART del Módulo Receptor Dual (Bridge Gateway)
El nodo Heltec configurado como receptor se enlaza mediante comunicación directa por hardware serial hacia la tarjeta Lilygo celular para actuar como puente hacia la nube.

| Tarjeta Origen (Heltec LoRa RX) | Pin de Salida | Tarjeta Destino (Lilygo Gateway) | Pin de Entrada | Descripción de la Interfaz |
| :--- | :--- | :--- | :--- | :--- |
| **Heltec LoRa 32 V2** | GPIO 23 (TXD) | **Lilygo SIM7080G-S3** | Pin 08 (RXD) | Traspaso serie de la cadena parseada. |
| **Heltec LoRa 32 V2** | GPIO 22 (RXD) | **Lilygo SIM7080G-S3** | Pin 03 (TXD) | Canal inverso de comandos serie. |
| **Heltec LoRa 32 V2** | GND | **Lilygo SIM7080G-S3** | GND | Retorno y masa común obligatoria. |

---

## 5. Matrices de Direccionamiento y Parámetros de Red

### 5.1 Direcciones de Dispositivos en el Bus I2C
* **Sensor de Iluminancia HDR TSL2591:** Dirección lógica `0x29` (Inalterable por hardware de fábrica).
* **Sensor Barométrico BMP280:** Dirección lógica `0x76` (Configurable a `0x77` al puentear el pin SDO a nivel alto).
* **Sensor GY-30 / BH1750 (Legacy):** Dirección lógica `0x23` (Modificable a `0x5C` mediante el pin ADDR).

### 5.2 Parámetros del Perfil de Radiofrecuencia LoRa P2P
* **Frecuencia Central de Operación:** 915 MHz (`915E6`), en cumplimiento estricto con la regulación de la banda ISM libre en México.
* **Word de Sincronización (SyncWord):** `0x12` (Actúa como identificador de red privada lógica).
* **Spreading Factor (Factor de Ensanchamiento):** SF7 por defecto (Garantiza velocidad y tasa de transferencia).
* **Ancho de Banda de Canal:** 125 kHz de estándar para modulación Chirp Spread Spectrum.
* **Potencia de Salida TX:** 14 dBm (Alineado con los límites máximos permitidos por el IFETEL).

### 5.3 Parámetros de Endpoints e Infraestructura del Ecosistema
* **MQTT Message Broker:** `HiveMQ Cloud` (Host del clúster remotos).
* **Tópico de Red (Topic URI):** `Itics/ITSOEH/sensor`.
* **Nivel de Confiabilidad MQTT:** `QoS 0` (Mecanismo fire-and-forget para flujo masivo regular).
* **Node-RED Web Interface:** Puerto `1880` expuesto en localhost.
* **InfluxDB Dashboard & API:** Puerto `8086` expuesto en localhost.
* **Grafana Server UI:** Puerto `3000` expuesto en localhost.

---

## 6. Arquitectura del Sistema y Flujo de Datos

El prototipo FLDSMDFR opera bajo una topología IoT estructurada en cuatro capas funcionales bien delimitadas:

```text
+-------------------------------------------------------------------------------+
| 1. CAPA DE ADQUISICIÓN: Sensores Ambientales (TSL2591 + BMP280 + MQ-135)      |
+-------------------------------------------------------------------------------+
                                        │
                                  (Bus I2C)
                                        ▼
+-------------------------------------------------------------------------------+
| 2. CAPA DE TRANSMISIÓN LOCAL: Heltec TX (Conversión y Modulación RF 915 MHz)  |
+-------------------------------------------------------------------------------+
                                        │
                         (Radio Enlace LoRa P2P - SyncWord 0x12)
                                        ▼
+-------------------------------------------------------------------------------+
| 3. CAPA RECEPTORA/PUENTE: Heltec RX + Lilygo IoT Gateway (Estructuración JSON)|
+-------------------------------------------------------------------------------+
                                        │
                         (Publicación Celular MQTT GPRS)
                                        ▼
+-------------------------------------------------------------------------------+
| 4. CAPA DE ORQUESTACIÓN Y PROCESAMIENTO: Docker Container Stack               |
|    - Broker HiveMQ Cloud (Enrutador de Mensajes)                             |
|    - Node-RED (Filtro e inyección de flujos de datos)                        |
|    - InfluxDB 2.x (Persistencia en Series Temporales en bucket 'Lumenia')     |
+-------------------------------------------------------------------------------+
                                        │
                                (Consultas Flux)
                                        ▼
+-------------------------------------------------------------------------------+
| 5. CAPA DE VISUALIZACIÓN FINAL: Grafana Real-Time Dashboards & Históricos     |
+-------------------------------------------------------------------------------+

```

### Formato de Interoperabilidad del Payload JSON

Una vez que el Bridge emite el mensaje a la nube, la información viaja estandarizada en la capa de aplicación con el siguiente esquema de llaves fijas:

```json
{
  "luz": 500.0,
  "temp": 25.0,
  "pres": 810.0,
  "volt": 4.2,
  "ppm": 400
}

```

---

## 7. Firmware Comentado del Proyecto

### 7.1 Nodo Emisor Periférico (`Codigo_Emisor.ino`)

Este sketch corre de forma dedicada en la tarjeta Heltec física acoplada a la instrumentación de campo.

```cpp
// =======================================================================
// FLDSMDFR — Nodo Emisor Periférico (Heltec WiFi LoRa 32 V2)
// Proyecto Integrador de Ingeniería en TIC - ITSOEH
// =======================================================================

#include "heltec.h"          // Controlador unificado Heltec (LoRa, OLED)
#include <Wire.h>             // Protocolo de bus de datos síncrono I2C
#include <BH1750.h>           // Librería para el bloque de iluminancia legacy
#include <Adafruit_BMP280.h>  // Librería para telemetría del sensor barométrico

#define BAND     915E6        // Frecuencia asignada por regulación en México (915 MHz)
#define SDA_PIN  4            // Pin de hardware asignado a la línea SDA I2C en Heltec V2
#define SCL_PIN  15           // Pin de hardware asignado a la línea SCL I2C en Heltec V2

BH1750 lightMeter;            // Inicialización de la clase para el sensor óptico
Adafruit_BMP280 bmp;          // Inicialización de la clase para el sensor barométrico

void setup() {
  // Inicialización de periféricos integrados de la tarjeta
  Heltec.begin(true, true, true, true, BAND);

  // Activación del Pin de paso energético Vext (Nivel lógico LOW satura el transistor)
  pinMode(Vext, OUTPUT);
  digitalWrite(Vext, LOW);
  delay(100);                 // Pausa de estabilización eléctrica de las celdas de entrada

  // Apertura del canal de datos I2C en los pines mapeados
  Wire.begin(SDA_PIN, SCL_PIN);

  // Verificación lógica de presencia de instrumentación en el inicio
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("GY-30 OK — Dirección I2C: 0x23");
  } else {
    Serial.println("ALERTA: Sensor de luz no detectado en bus.");
  }

  if (bmp.begin(0x76)) {
    Serial.println("BMP280 OK — Dirección I2C: 0x76");
  } else {
    Serial.println("ALERTA: Módulo barométrico no detectado.");
  }

  // Seteo de la clave compartida de radiofrecuencia para exclusión lógica de red
  LoRa.setSyncWord(0x12);
}

void loop() {
  // Captura de las lecturas físicas analógico-digitales de sensores
  float luz  = lightMeter.readLightLevel(); // Captura nativa en luxes
  float temp = bmp.readTemperature();       // Captura nativa en grados Celsius
  float pres = bmp.readPressure() / 100.0F; // Conversión matemática de Pascales a hPa

  // Construcción de la cadena compacta CSV delimitada por comas para optimizar RF
  String paquete = String(luz, 4) + "," + String(temp, 2) + "," + String(pres, 2);

  // Despliegue ráfaga de transmisión inalámbrica LoRa
  LoRa.beginPacket();  
  LoRa.print(paquete); 
  LoRa.endPacket();    

  // Debug local en puerto serie y buffer de pantalla OLED
  Serial.println("Payload Enviado: " + paquete);
  Heltec.display->clear();
  Heltec.display->drawString(0, 0,  "EMISOR — FLDSMDFR");
  Heltec.display->drawString(0, 15, "Luz: " + String(luz, 2) + " lx");
  Heltec.display->drawString(0, 30, "Temp: " + String(temp, 2) + " C");
  Heltec.display->drawString(0, 45, "Pres: " + String(pres, 2) + " hPa");
  Heltec.display->display();

  delay(2000); // Intervalo de ciclo operativo de refresco (2 segundos)
}

```

### 7.2 Nodo Receptor Local e Interfaz de Red Gateway (`Codigo_Receptor.ino`)

Sketch dedicado para la decodificación de tramas RF y aprovisionamiento del servidor web asíncrono asilado en la red LAN local.

```cpp
// =======================================================================
// FLDSMDFR — Nodo Receptor e Interfaz de Servidor Web Local
// Proyecto Integrador de Ingeniería en TIC - ITSOEH
// =======================================================================

#include "heltec.h"
#include <WiFi.h>
#include <ESPAsyncWebServer.h>  // Librería para llamadas HTTP asíncronas no-bloqueantes

#define BAND 915E6

// Configuración de credenciales de acceso a la infraestructura Wi-Fi local
const char* ssid     = "TU_SSID_RED";       
const char* password = "TU_PASSWORD_RED";   

// Registro de almacenamiento global para refresco dinámico de datos
String gLuz = "0", gTemp = "0", gPres = "0";

AsyncWebServer server(80); // Apertura de servicio en el puerto web estándar HTTP 80

// Plantilla de renderizado de la interfaz HTML embebida en memoria flash PROGMEM
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html>
<head>
  <meta charset="UTF-8">
  <title>FLDSMDFR — Panel Monitor LoRa</title>
  <style>
    body { background:#1e1e2f; color:white; font-family:sans-serif; text-align:center; padding-top:40px; }
    .card { background:#2a2a40; padding:25px; border-radius:15px; display:inline-block; margin:15px; border-top:5px solid #20c997; width:200px; }
    .value { font-size:2.5em; font-weight:bold; margin-top:10px; }
  </style>
</head>
<body>
  <h2>Monitor Local del Servidor FLDSMDFR</h2>
  <div class="card"><div>Iluminancia (lx)</div><div class="value" id="luz">--</div></div>
  <div class="card"><div>Temperatura (°C)</div><div class="value" id="temp">--</div></div>
  <div class="card"><div>Presión (hPa)</div><div class="value" id="pres">--</div></div>
  <script>
    // Rutina cíclica de consumo asíncrono mediante fetch API local sin recargar web
    setInterval(() => {
      fetch('/data').then(r => r.json()).then(d => {
        document.getElementById('luz').innerText  = d.luz;
        document.getElementById('temp').innerText = d.temp;
        document.getElementById('pres').innerText = d.pres;
      });
    }, 2000);
  </script>
</body></html>
)rawliteral";

void setup() {
  Heltec.begin(true, true, true, true, BAND);
  LoRa.setSyncWord(0x12); // Acoplamiento estricto con el perfil de modulación emisor

  // Conexión lógica a la red inalámbrica local
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  }
  Serial.println("\nServidor listo. IP Asignada: " + WiFi.localIP().toString());

  // Definición de las rutas lógicas del Servidor Web
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", index_html);
  });
  
  server.on("/data", HTTP_GET, [](AsyncWebServerRequest *request) {
    // Encapsulado de las variables de cadena globales en un objeto JSON estandarizado
    String json = "{\"luz\":"  + String(gLuz.toFloat(), 2) +
                  ",\"temp\":" + String(gTemp.toFloat(), 2) +
                  ",\"pres\":" + String(gPres.toFloat(), 2) + "}";
    request->send(200, "application/json", json);
  });
  
  server.begin(); // Apertura del daemon del socket web

  // Despliegue permanente de la IP de consulta en la pantalla local OLED
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, "IP Servidor Web:");
  Heltec.display->drawString(0, 15, WiFi.localIP().toString());
  Heltec.display->display();
}

void loop() {
  // Sondeo cíclico de presencia de paquetes en el buffer del transceptor LoRa
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String datos = "";
    while (LoRa.available()) { 
      datos += (char)LoRa.read(); 
    }
    Serial.println("Trama Recibida: " + datos);

    // Algoritmo de desestructuración y parsing del string CSV por comas
    int coma1 = datos.indexOf(',');
    int coma2 = datos.indexOf(',', coma1 + 1);
    if (coma1 != -1 && coma2 != -1) {
      gLuz  = datos.substring(0, coma1);
      gTemp = datos.substring(coma1 + 1, coma2);
      gPres = datos.substring(coma2 + 1);
      gLuz.trim(); gTemp.trim(); gPres.trim();
    }

    // Actualización de pantalla de depuración in-situ
    Heltec.display->clear();
    Heltec.display->drawString(0, 0,  "RX STATUS: OK");
    Heltec.display->drawString(0, 15, "Luz: " + gLuz + " lx");
    Heltec.display->drawString(0, 30, "Temp: " + gTemp + " C");
    Heltec.display->display();
  }
}

```

---

## 8. Configuración del Backend e Infraestructura Docker

El backend completo de la aplicación se despliega mediante microservicios orquestados en Docker Compose desde la carpeta `/docker` del proyecto.

```yaml
version: '3.8'
services:
  # Node-RED: Motor de parsing, lógica de flujo y conexión MQTT de entrada
  nodered:
    image: nodered/node-red:latest
    ports:
      - "1880:1880"
    volumes:
      - nodered_data:/data
    restart: unless-stopped

  # InfluxDB: Base de datos relacional orientada a series temporales continuas
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=lumenia2024
      - DOCKER_INFLUXDB_INIT_ORG=ITSOEH
      - DOCKER_INFLUXDB_INIT_BUCKET=Lumenia
    volumes:
      - influxdb_data:/var/lib/influxdb2
    restart: unless-stopped

  # Grafana: Servidor de despliegue de paneles e instrumentación interactiva
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  nodered_data:
  influxdb_data:
  grafana_data:

```

---

## 9. Gestión Energética y Autonomía de Campo

El dispositivo periférico móvil ha sido optimizado estructuralmente para operación en campo mediante celdas independientes. El microcontrolador Heltec posee un circuito integrado de carga acoplado a un conector JST-PH 2.0 nativo para celdas de polímero de litio (LiPo) de 3.7V.

* **Consumo de Corriente Promedio Activo:** ~180 mA (Durante ciclos ráfaga de sensado y disparo de RF LoRa).
* **Consumo de Corriente en Modo Suspensión:** ~50 µA (Activado mediante el controlador nativo de bajo consumo `esp_deep_sleep_start()`).

### Tabla de Autonomía de Baterías Estimada en Despliegue

La proyección considera un ciclo de trabajo estándar con estados del 5% en ráfaga activa y 95% en suspensión profunda.

| Capacidad de la Celda LiPo | Horas en Operación Activa Continua | Duración Real Estimada con Ciclos Deep Sleep |
| --- | --- | --- |
| **1000 mAh** | ~5.5 horas | **~4.5 días** de autonomía. |
| **2000 mAh** | ~11.0 horas | **~9.0 días** de autonomía. |
| **3000 mAh** | ~16.5 horas | **~13.5 días** de autonomía. |

---

## 10. Recomendaciones, Precauciones y Solución de Problemas

### ⚠️ Precauciones Eléctricas y de Seguridad

* **Límite de Tensión del ADC:** Los canales de lectura analógica (GPIO 36) del ESP32 toleran estrictamente un rango de **0 a 3.3V**. Conectar salidas directas de celdas de 5V sin un puente de resistencias divisor de tensión provocará la destrucción permanente del silicio interno de la tarjeta Heltec.
* **Aislamiento Térmico Óptico:** El sensor de gas MQ-135 disipa calor de forma pasiva debido a su filamento calefactor de óxido interno. Mantenga una separación física de al menos 5 centímetros con el sensor óptico TSL2591 para mitigar variaciones y errores de deriva en las mediciones de luz cenital.
* **Validación de Polaridad de Celdas:** El estándar de cables rojo/negro de los conectores JST comerciales suele estar invertido en algunos distribuidores. Valide siempre el pinout de la batería LiPo con un multímetro antes de conectarlo a la placa para evitar daños térmicos destructivos inmediatos.

### 🛠️ Matriz de Solución de Fallas Comunes (Troubleshooting)

| Problema Encontrado | Causa Raíz Más Probable | Acción Correctiva de Solución |
| --- | --- | --- |
| Error serial `Sensor de luz no detectado`. | La línea conmutada de potencia `Vext` de los pines compartidos del bus I2C está desactivada. | Confirmar la llamada explícita `digitalWrite(Vext, LOW)` en el método inicial de configuración. |
| El emisor transmite pero el nodo receptor no intercepta tramas. | Desajuste en el parámetro de sincronización de la palabra clave de modulación RF LoRa. | Verificar la concordancia exacta de la instrucción `LoRa.setSyncWord(0x12)` en ambos sketches. |
| Node-RED no recibe datos procedentes de la nube. | Discrepancia ortográfica en las cadenas de jerarquía de los tópicos del nodo MQTT input. | Sustituir el string del topic de forma temporal por el comodín wildcard `#` (`Itics/#`) para depurar la ruta exacta. |
| Los instrumentos analíticos de Grafana muestran `No Data`. | Inconsistencia de mapeo de las variables lógicas en las consultas estructuradas en lenguaje Flux. | Comprobar que los buckets apunten al nombre exacto configurado mediante la consulta: `from(bucket: "Lumenia")`. |

---
