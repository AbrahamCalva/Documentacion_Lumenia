#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include "HT_SSD1306Wire.h" 
#include <ArduinoJson.h>

// --- CONFIGURACIÓN FÍSICA HELTEC V2 ---
#define BAND     915E6
#define SCK      5
#define MISO     19
#define MOSI     27
#define SS       18
#define RST_LORA 14
#define DIO0     26
#define SDA_PIN  4
#define SCL_PIN  15
#define RST_OLED 16 
#define Vext     21

SSD1306Wire display(0x3c, 500000, SDA_PIN, SCL_PIN, GEOMETRY_128_64, RST_OLED);

void setup() {
  Serial.begin(115200);
  
  pinMode(Vext, OUTPUT);
  digitalWrite(Vext, LOW); 
  delay(500); 

  pinMode(RST_OLED, OUTPUT);
  digitalWrite(RST_OLED, LOW);
  delay(50);
  digitalWrite(RST_OLED, HIGH);

  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST_LORA, DIO0);
  if (!LoRa.begin(BAND)) {
    while(1);
  }
  LoRa.setSyncWord(0x12);
}

void loop() {
  // --- 1. ESTADO: ESPERANDO PAQUETE ---
  display.clear();
  display.setFont(ArialMT_Plain_16); // Fuente más grande para el estado
  display.drawString(0, 0, "MODO: IDLE");
  display.setFont(ArialMT_Plain_10);
  display.drawString(0, 25, "ESPERANDO PAQUETE...");
  display.display();

  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {
    String paqueteJson = "";
    while (LoRa.available()) {
      paqueteJson += (char)LoRa.read();
    }

    // --- 2. ESTADO: RECIBIENDO PAQUETE (5 Segundos) ---
    display.clear();
    display.setFont(ArialMT_Plain_16);
    display.drawString(0, 0, "RECIBIENDO...");
    display.setFont(ArialMT_Plain_10);
    
    // Parsear rápido para mostrar info en pantalla
    JsonDocument doc;
    deserializeJson(doc, paqueteJson);
    
    display.drawString(0, 22, "Datos: " + paqueteJson.substring(0, 25) + "...");
    display.drawString(0, 35, "T: " + String((float)doc["temp"], 1) + "C | PPM: " + String((int)doc["ppm"]));
    display.drawString(0, 50, "Señal (RSSI): " + String(LoRa.packetRssi()));
    display.display();
    
    delay(5000); // PAUSA SOLICITADA DE 5 SEGUNDOS

    // --- 3. ESTADO: ENVIANDO A LILYGO ---
    display.clear();
    display.setFont(ArialMT_Plain_16);
    display.drawString(0, 10, "ENVIANDO A");
    display.drawString(0, 30, "LILYGO (MAC)...");
    display.display();
    
    // Envío real por puerto serie
    Serial.println(paqueteJson); 
    delay(1500); // Pausa para que el usuario vea el mensaje

    // --- 4. ESTADO: PAQUETE ENVIADO ---
    display.clear();
    display.setFont(ArialMT_Plain_16);
    display.drawString(0, 15, "PAQUETE ENVIADO");
    display.setFont(ArialMT_Plain_10);
    display.drawString(0, 40, "Check HiveMQ Cloud");
    display.display();
    
    delay(2000); // Mostrar confirmación antes de volver a esperar
  }
}