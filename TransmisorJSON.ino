#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include "HT_SSD1306Wire.h" 
#include <BH1750.h>
#include <Adafruit_BMP280.h>

// --- CONFIGURACIÓN FÍSICA HELTEC V2 ---
#define BAND    915E6
#define SCK     5
#define MISO    19
#define MOSI    27
#define SS      18
#define RST_LORA 14
#define DIO0    26

#define SDA_PIN 4
#define SCL_PIN 15
#define RST_OLED 16  // <- ESTE ES EL PIN CORRECTO PARA LA V2
#define Vext    21
#define MQ135_PIN 36

// Iniciamos la pantalla con el pin 16 para el Reset
SSD1306Wire  display(0x3c, 500000, SDA_PIN, SCL_PIN, GEOMETRY_128_64, RST_OLED);
BH1750 lightMeter;
Adafruit_BMP280 bmp; 

float g_luz = 0, g_temp = 0, g_pres = 0, g_volt = 0, g_ppm = 0;
bool bmp_ok = false;

void setup() {
  Serial.begin(115200);
  
  // 1. ACTIVAR ENERGÍA FÍSICA (Vext)
  pinMode(Vext, OUTPUT);
  digitalWrite(Vext, LOW); 
  delay(500); 

  // 2. RESET FÍSICO DE LA PANTALLA
  pinMode(RST_OLED, OUTPUT);
  digitalWrite(RST_OLED, LOW);
  delay(50);
  digitalWrite(RST_OLED, HIGH);

  // 3. INICIAR PANTALLA
  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  display.clear();
  display.drawString(0, 0, "SISTEMA INICIADO");
  display.display();

  // 4. INICIAR LORA
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST_LORA, DIO0);
  //
  if (!LoRa.begin(BAND)) {
    Serial.println("Error LoRa");
  }
  LoRa.setSyncWord(0x12);

  // 5. INICIAR SENSORES
  Wire.begin(SDA_PIN, SCL_PIN);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);
  
  if (bmp.begin(0x76) || bmp.begin(0x77)) {
    bmp_ok = true;
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X2, Adafruit_BMP280::SAMPLING_X16, Adafruit_BMP280::FILTER_X16, Adafruit_BMP280::STANDBY_MS_500);
  }

  analogSetAttenuation(ADC_11db);
}

void loop() {
  // LECTURAS (Mantenemos tu lógica que ya funciona)
  float luz = lightMeter.readLightLevel();
  if (!isnan(luz) && luz >= 0) g_luz = luz;

  if (bmp_ok) {
    float t = bmp.readTemperature();
    float p = bmp.readPressure() / 100.0F;
    if (!isnan(t) && t != 0) { g_temp = t; g_pres = p; }
  }

  long suma = 0;
  for(int i = 0; i < 40; i++) { suma += analogRead(MQ135_PIN); delay(1); }
  g_volt = ((suma / 40.0) * 3.3) / 4095.0;
  
  float Rs = (3.3 - g_volt) / (g_volt > 0.1 ? g_volt : 0.1); 
  g_ppm = 116.6 * pow((Rs / 8.70), -2.769); 
  if (g_ppm < 400) g_ppm = 400; 

  // PREPARAR JSON
  String paquete = "{\"luz\":" + String(g_luz, 4) + 
                   ",\"temp\":" + String(g_temp, 2) + 
                   ",\"pres\":" + String(g_pres, 2) + 
                   ",\"volt\":" + String(g_volt, 2) + 
                   ",\"ppm\":" + String(g_ppm, 0) + "}";
                   
  // ENVIAR POR LORA
  LoRa.beginPacket();
  LoRa.print(paquete);
  LoRa.endPacket();

  // --- DIBUJAR EN OLED ---
  display.clear();
  display.setFont(ArialMT_Plain_10);
  
  // Fila 1: Luz y Clima
  display.drawString(0, 0, "L: " + String(g_luz, 1) + " lx | T: " + String(g_temp, 1) + "C");
  
  // Fila 2: Presión y Gas
  display.drawString(0, 13, "P: " + String(g_pres, 1) + " hPa");
  display.drawString(0, 26, "Gas: " + String((int)g_ppm) + " PPM (" + String(g_volt, 2) + "V)");
  
  // Fila 3: Estado de Skyglow
  String estado = (g_volt < 0.8) ? "CIELO: LIMPIO" : (g_volt < 1.3 ? "CIELO: BRUMA" : "CIELO: CONTAMINADO");
  display.drawString(0, 40, estado);
  
  // Fila 4: Barra de Progreso
  int anchoBarra = map(constrain((int)g_ppm, 400, 2000), 400, 2000, 0, 128);
  display.drawRect(0, 54, 128, 8);        
  display.fillRect(0, 54, anchoBarra, 8); 
  
  display.display();

  Serial.println(paquete);
  delay(3000); 
}