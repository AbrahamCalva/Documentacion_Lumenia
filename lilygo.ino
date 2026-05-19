/**
 * PROYECTO: Gateway Híbrido ITSOEH (WiFi Seguro + SIM)
 * ERROR A CORREGIR: WiFi conectaba pero MQTT no.
 */

#define TINY_GSM_MODEM_SIM7000 
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> // Necesario para HiveMQ Cloud

// --- TUS DATOS ---
const char* wifiSSID  = "POCO X7 Pro";      
const char* wifiPass  = "12345678";
const char* broker    = "059c09d2b86243c888215960a8d9811b.s1.eu.hivemq.cloud";
const char* mqttUser  = "Alumno-ITSOEH";
const char* mqttPass  = "Alumno-ITSOEH1";

// --- CONFIGURACIÓN ---
#define HELTEC_RX 32 
#define HELTEC_TX 33 

HardwareSerial ModemSerial(1);
HardwareSerial SerialHeltec(2); 
TinyGsm modem(ModemSerial);

WiFiClientSecure wifiClient; // Cliente con SSL para WiFi
TinyGsmClient gsmClient(modem);
PubSubClient mqtt;

bool usandoWiFi = false;

void setup() {
  Serial.begin(115200);
  SerialHeltec.begin(115200, SERIAL_8N1, HELTEC_RX, HELTEC_TX);
  ModemSerial.begin(115200, SERIAL_8N1, 26, 27);
  
  // Importante para HiveMQ Cloud via WiFi
  wifiClient.setInsecure(); 
  
  establecerInternet();
}

void establecerInternet() {
  while (true) {
    // Intento 1: WiFi (Es más rápido para pruebas en el ITSOEH)
    if (conectarWiFi()) break;
    
    // Intento 2: SIM
    // if (conectarSIM()) break; // Descomenta cuando tengas la pila
    
    Serial.println("Reintentando conexión en 5s...");
    delay(5000);
  }
}

bool conectarWiFi() {
  Serial.println("\n--- Intentando WiFi ---");
  WiFi.begin(wifiSSID, wifiPass);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > 15000) return false;
    delay(500); Serial.print(".");
  }
  
  // Si conecta WiFi, usamos puerto 8883 (Seguro)
  mqtt.setClient(wifiClient);
  mqtt.setServer(broker, 8883); 
  usandoWiFi = true;
  Serial.println("\nWiFi Conectado!");
  return true;
}

void reconectarMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Intentando conectar a HiveMQ...");
    String id = "ITSOEH-GW-" + String(random(0, 999));
    
    if (mqtt.connect(id.c_str(), mqttUser, mqttPass)) {
      Serial.println(" ¡EXITO! MQTT Online.");
    } else {
      Serial.print(" ERROR. Código rc = ");
      Serial.print(mqtt.state()); 
      Serial.println(" (Reintentando...)");
      
      // Si el error es persistente, revisamos internet
      if (WiFi.status() != WL_CONNECTED) return; 
      delay(3000);
    }
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    establecerInternet();
  }

  if (!mqtt.connected()) {
    reconectarMQTT();
  }
  
  mqtt.loop();

  // Escuchar a la Heltec
  if (SerialHeltec.available()) {
    String datos = SerialHeltec.readStringUntil('\n');
    Serial.print("Dato Recibido: "); Serial.println(datos);
    
    if (mqtt.publish("Itics/ITSOEH/lumenia", datos.c_str())) {
      Serial.println(">>> Enviado a la Nube.");
    } else {
      Serial.println(">>> Error al publicar.");
    }
  }
}