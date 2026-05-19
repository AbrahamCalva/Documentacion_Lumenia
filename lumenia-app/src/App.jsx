import { useState, useEffect } from "react";

// ==========================================
// 1. CONFIGURACIÓN DE TOPOLOGÍA DE RED
// ==========================================
const NETWORK_TOPOLOGY = {
  NODE_RED_SERVER: "http://192.168.1.10:1880/ui",    // Equipo B: Servidor de Orquestación de Flujo (UI)
  GRAFANA_SERVER: "http://192.168.1.20:3000",       // Equipo C: Servidor de Analítica Avanzada
  INFLUXDB_SERVER: "http://192.168.1.20:8086"       // Equipo C: Motor de Persistencia Temporal
};

// ==========================================
// 2. REGISTRO DE USUARIOS AUTORIZADOS
// ==========================================
const USER_REGISTRY = [
  { username: "abraham.calva", password: "fldsmdfr_itsoeh_1", name: "Calva Abraham" },
  { username: "fernando.gonzaga", password: "fldsmdfr_itsoeh_2", name: "Gonzaga López Luis Fernando" },
  { username: "gustavo.lopez", password: "fldsmdfr_itsoeh_3", name: "López Paz Gustavo" },
  { username: "brayan.martinez", password: "fldsmdfr_itsoeh_4", name: "Martínez Hernández Brayan" }
];

// ==========================================
// 3. ESTRUCTURAS DE DATOS INSTITUCIONALES
// ==========================================
const NAV_ITEMS = ["Inicio", "Problemática", "Instrumentación", "Arquitectura", "Resultados", "Contacto"];

const MARCO_TEORICO = [
  { titulo: "Resplandor Lumínico (Skyglow)", desc: "Dispersión de la luz artificial nocturna (ALAN) en los aerosoles y partículas suspendidas de la atmósfera. Genera un domo de luz que borra la Vía Láctea para más del 80% de la población mundial." },
  { titulo: "Ciclo Circadiano y Salud", desc: "La sobreexposición a emisiones de luz blanca o azul durante la noche inhibe drásticamente la secreción de melatonina, provocando trastornos del sueño y desequilibrios metabólicos crónicos." },
  { titulo: "Efecto de Dispersión Mie", desc: "Interacción física donde las partículas contaminantes y la nubosidad local actúan como elementos reflejantes, atrapando la luz dirigida de forma ineficiente hacia el cenit y devolviéndola a la superficie." },
  { titulo: "Cumplimiento de la NOM", desc: "Infraestructura orientada a proveer métricas cuantitativas que evalúen el apego real a normativas de eficiencia energética en vialidades y alumbrado público como la NOM-013-ENER-2013." }
];

const COMPONENTES_HARDWARE = [
  {
    num: "01",
    nombre: "Nodo Adquisición y Transmisión (FLDSMDFR)",
    tipo: "Unidad Periférica de Campo",
    desc: "Diseñado sobre una placa de prototipos perforada y soldada para garantizar estabilidad eléctrica absoluta en intemperie. Emplea un microcontrolador Heltec WiFi LoRa 32 V2 configurado en esquemas de bajo consumo a través del pin de alimentación externa Vext para la gestión de intervalos de muestreo. Todo el hardware se resguarda dentro de una carcasa personalizada impresa en 3D con ventilación lateral dedicada para disipación de la batería LiPo y acoplamiento óptico directo al cenit.",
    sensores: [
      { modelo: "TSL2591 (High Dynamic Range)", func: "Evolución tecnológica del BH1750. Posee una sensibilidad extrema de hasta 188 microluxes, permitiendo capturar variaciones críticas en condiciones de skyglow severo." },
      { modelo: "BMP280 (I2C)", func: "Barómetro y termómetro digital encargado de registrar la presión barométrica local y temperatura para contextualizar la densidad del aire." },
      { modelo: "MQ-135 (Análogo/GPIO)", func: "Monitoreo químico encargado de detectar agentes contaminantes y partículas suspendidas correlacionadas con la amplificación del brillo nocturno." }
    ],
    tags: ["Heltec V2", "TSL2591", "Bus I2C Shared", "Vext Power Control"]
  },
  {
    num: "02",
    nombre: "Nodo Receptor (Gateway IoT dual)",
    tipo: "Concentrador e Infraestructura de Red",
    desc: "Estación base centralizada que implementa una arquitectura punto a punto en la capa física. Recibe payloads encriptados por radiofrecuencia de los nodos periféricos y utiliza una tarjeta de desarrollo Lilygo (TTGO-T SIM7080G-S3) que actúa como bridge de red inalámbrica móvil (LPWAN a IP). Se encarga de procesar las cadenas binarias, parsear los delimitadores y redireccionar la información hacia la nube pública.",
    sensores: [
      { modelo: "Módulo RF SX1276 (SPI)", func: "Sintonizado a la banda ISM de 915 MHz autorizada en México con Sync Word común (0x12) para filtrado de nodos." },
      { modelo: "Módulo Lilygo SIM7080G", func: "Enlace celular encargado de inyectar las tramas de datos hacia el broker MQTT remoto mediante peticiones ligeras de red." }
    ],
    tags: ["Lilygo Bridge", "915 MHz ISM", "Sync Word 0x12", "HiveMQ Integration"]
  }
];

const ORQUESTACION_SOFTWARE = [
  { etapa: "Estructura de Datos", titulo: "Serialización JSON de Capa de Aplicación", detalle: "El procesamiento local en el microcontrolador empaqueta las lecturas crudas en cadenas optimizadas clave-valor: {'luz': float, 'temp': float, 'pres': float, 'volt': float, 'ppm': int}. Este formato garantiza ligereza en la transmisión y total interoperabilidad con servicios web externos." },
  { etapa: "Broker de Mensajería", titulo: "HiveMQ Cloud & QoS Jerárquico", detalle: "La centralización e inyección de variables multidimensionales se administra mediante tópicos distribuidos en HiveMQ. Se implementa Quality of Service (QoS 0) para flujos constantes de telemetría masiva, con capacidad de configuración de niveles superiores (QoS 1 y 2) para el disparo automatizado de alertas críticas de contaminación o fallos de voltaje." },
  { etapa: "Persistencia Temporal", titulo: "Contenedores Docker & Motor InfluxDB", detalle: "La arquitectura de backend se despliega de forma aislada mediante Docker, utilizando Node-RED para el ruteo del flujo de información. Las series temporales se almacenan de manera síncrona en InfluxDB, recuperando los históricos mediante consultas Flux optimizadas con latencias de respuesta de apenas 0.01 segundos." }
];

const METRICAS_VALIDADAS = [
  { metrica: "Intensidad Lumínica Nominal", valor: "100 lx", contexto: "Lecturas base estables del sensor óptico bajo condiciones controladas de iluminación en el laboratorio." },
  { metrica: "Presión Atmosférica Local", valor: "810 hPa", contexto: "Valor consistente con la altitud geográfica del entorno de pruebas institucional del ITSOEH." },
  { metrica: "Monitoreo de Calidad del Aire", valor: "400 PPM", contexto: "Lectura base capturada por el MQ-135 para el análisis de partículas suspendidas." },
  { metrica: "Diagnóstico de Salud Energética", valor: "3.7V - 5.0V", contexto: "Monitoreo continuo del voltaje de operación de la batería LiPo para control de fallos en campo." }
];

const INTEGRANTES = [
  { nombre: "Calva Abraham", matricula: "230110637", rol: "Desarrollo de Software, IoT y Modelado CAD" },
  { nombre: "Gonzaga López Luis Fernando", matricula: "230110528", rol: "Configuración de Red e Infraestructura Inalámbrica" },
  { nombre: "López Paz Gustavo", matricula: "230110531", rol: "Integración de Hardware y Validación en Campo" },
  { nombre: "Martínez Hernández Brayan", matricula: "230110578", rol: "Arquitectura de Datos y Análisis de Confort Ambiental" }
];

// ==========================================
// 4. DICCIONARIOS DE ESTILOS INLINE (EVITA TDZ)
// ==========================================
const MainViewNavStyle = (active) => ({
  background: active ? "rgba(245, 158, 11, 0.08)" : "transparent",
  border: active ? "1px solid #f59e0b" : "1px solid transparent",
  color: active ? "#f59e0b" : "#94a3b8",
  cursor: "pointer",
  padding: "8px 16px",
  borderRadius: 4,
  fontSize: "13px",
  fontWeight: active ? 600 : 400,
  fontFamily: "inherit",
  transition: "all 0.2s"
});

const InputFormStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(99, 102, 241, 0.25)",
  borderRadius: 4,
  padding: "12px",
  color: "#e2e8f0",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box"
};

const BadgeNumberStyle = {
  minWidth: 52, height: 52, borderRadius: 8, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.3)",
  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 700, fontSize: 16, color: "#f59e0b"
};

const IframeWrapperStyle = {
  flex: 1, display: "flex", flexDirection: "column", background: "#05070f", animation: "fadeIn 0.4s ease"
};

const IframeHeaderStyle = {
  background: "#090d1a", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 2rem", fontSize: "12px", fontFamily: "monospace", color: "#94a3b8"
};

const IframeStyle = {
  width: "100%", flex: 1, border: "none", background: "#05070f"
};

const TerminalRowStyle = {
  fontFamily: "monospace", fontSize: "13px", color: "#e2e8f0", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: 4, borderLeft: "3px solid #6366f1"
};

// ==========================================
// 5. COMPONENTES DE SOPORTE INTERNOS
// ==========================================
function SectionTitle({ children, uppercase }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 20, height: 1.5, background: "#f59e0b" }} />
      <span style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 2, textTransform: uppercase ? "uppercase" : "none", fontFamily: "monospace", fontWeight: 600 }}>
        {children}
      </span>
    </div>
  );
}

// ==========================================
// 6. COMPONENTE PRINCIPAL (EXPORT DEFAULT)
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mainView, setMainView] = useState("proyecto"); 
  const [activeDocSection, setActiveDocSection] = useState("Inicio");

  const [inputUser, setInputUser] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    document.title = "Lumenia · Dark-Sky Field Research";
    const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "shortcut icon";
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23f59e0b'>✦</text></svg>";
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const validUser = USER_REGISTRY.find(
      (u) => u.username === inputUser.trim().toLowerCase() && u.password === inputPass
    );

    if (validUser) {
      setIsAuthenticated(true);
      setCurrentUser(validUser.name);
      setLoginError("");
    } else {
      setLoginError("Credenciales de acceso no válidas. Verifique el identificador corporativo.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMainView("proyecto");
    setInputUser("");
    setInputPass("");
  };

  const scrollToDocSection = (id) => {
    setMainView("proyecto");
    setActiveDocSection(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // VISTA CONDICIONAL: LOGIN PRIVADO
  if (!isAuthenticated) {
    return (
      <div style={{
        fontFamily: "'Georgia', serif",
        background: "linear-gradient(135deg, #060914 0%, #0a1024 50%, #060914 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "100%", maxWidth: "420px", background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 8, padding: "3rem 2.5rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: 28, color: "#f59e0b", fontWeight: "bold" }}>✦</span>
            <h2 style={{ fontSize: "1.6rem", color: "#f8fafc", margin: "0.5rem 0 0 0", letterSpacing: 1 }}>SISTEMA LUMENIA</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px", textTransform: "uppercase", letterSpacing: 1.5 }}>Acceso Privado de Investigación</p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: "6px" }}>Usuario corporativo</label>
              <input type="text" value={inputUser} onChange={(e) => setInputUser(e.target.value)} placeholder="ej: abraham.calva" required style={InputFormStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: "6px" }}>Contraseña de seguridad</label>
              <input type="password" value={inputPass} onChange={(e) => setInputPass(e.target.value)} placeholder="••••••••" required style={InputFormStyle} />
            </div>

            {loginError && (
              <div style={{ color: "#ef4444", fontSize: "12px", lineHeight: "1.4", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "10px", borderRadius: 4 }}>
                {loginError}
              </div>
            )}

            <button type="submit" style={{ background: "#f59e0b", color: "#060914", border: "none", borderRadius: 4, padding: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              Validar Identidad
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PLATAFORMA PRINCIPAL CONMUTABLE
  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #090d1a 0%, #0c1430 50%, #090d1a 100%)",
      minHeight: "100vh", display: "flex", flexDirection: "column", color: "#e2e8f0", margin: 0, padding: 0
    }}>
      {/* HEADER PRINCIPAL */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(9, 13, 26, 0.94)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(99, 102, 241, 0.15)", padding: "0 2rem"
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, color: "#f59e0b", fontWeight: "bold" }}>✦</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f8fafc", letterSpacing: 1.5 }}>FLDSMDFR · TELEMETRÍA</span>
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setMainView("proyecto")} style={MainViewNavStyle(mainView === "proyecto")}>Reporte</button>
            <button onClick={() => setMainView("nodered")} style={MainViewNavStyle(mainView === "nodered")}>Node-RED Flows</button>
            <button onClick={() => setMainView("grafana")} style={MainViewNavStyle(mainView === "grafana")}>Grafana Dashboard</button>
            <button onClick={() => setMainView("influxdb")} style={MainViewNavStyle(mainView === "influxdb")}>InfluxDB Console</button>
            
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)", margin: "0 12px" }} />
            <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#ef4444", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Salir</button>
          </div>
        </div>
      </nav>

      {/* SUB-NAVBAR EXCLUSIVA DEL REPORTE */}
      {mainView === "proyecto" && (
        <div style={{ background: "rgba(5, 8, 18, 0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "4px 2rem" }}>
          <div style={{ maxWidth: 1150, margin: "0 auto", display: "flex", gap: "10px", justifyContent: "flex-start" }}>
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => scrollToDocSection(item)} style={{ background: "none", border: "none", color: "#64748b", padding: "6px 10px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#f59e0b"} onMouseLeave={(e) => e.target.style.color = "#64748b"}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "rgba(245, 158, 11, 0.03)", borderBottom: "1px solid rgba(245, 158, 11, 0.08)", padding: "6px 2rem", fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>
        Infraestructura local · Investigador: <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{currentUser}</span>
      </div>

      {/* CONTENIDO DINÁMICO */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {mainView === "proyecto" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <section id="Inicio" style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 2rem", position: "relative" }}>
              <div style={{ position: "relative", maxWidth: 800 }}>
                <div style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 4, padding: "6px 16px", fontSize: 11, color: "#f59e0b", letterSpacing: 2, marginBottom: 24, textTransform: "uppercase", fontWeight: 600 }}>
                  Ingeniería en TIC's · Proyecto Integrador 2026
                </div>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 1.5rem", color: "#f8fafc" }}>
                  Full Light Detection &<br /><span style={{ color: "#f59e0b" }}>Skyglow Monitoring</span>
                </h1>
                <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#94a3b8", maxWidth: 680, margin: "0 auto 3rem" }}>
                  Infraestructura de investigación de campo y monitoreo ambiental diseñada para transformar variables físicas de iluminación artificial nocturna en datos técnicos estructurados de alta precisión.
                </p>
              </div>
            </section>

            <section id="Problemática" style={{ padding: "6rem 2rem", borderTop: "1px solid rgba(99, 102, 241, 0.12)" }}>
              <div style={{ maxWidth: 950, margin: "0 auto" }}>
                <SectionTitle uppercase>Análisis del Fenómeno Urbano</SectionTitle>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "2rem", color: "#f8fafc" }}>El impacto de la sobreiluminación nocturna</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40 }}>
                  <div>
                    <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: "#94a3b8", margin: "0 0 1.5rem" }}>
                      La transición hacia entornos urbanos hiper-iluminados ha transformado la noche de un fenómeno biológico natural en un producto de la ingeniería civil inadecuada. La falta de datos locales impide la correcta evaluación del impacto de las emisiones hacia la bóveda celeste.
                    </p>
                    <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: "#94a3b8", margin: 0 }}>
                      Este proyecto correlaciona de manera científica los niveles de iluminancia con la estabilidad de los frentes climáticos y agentes contaminantes suspendidos, entregando mapas y lecturas basadas en evidencia real.
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                    {MARCO_TEORICO.map(item => (
                      <div key={item.titulo} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 8, padding: "20px" }}>
                        <h4 style={{ fontSize: "1rem", color: "#f59e0b", margin: "0 0 6px 0", fontWeight: 700 }}>{item.titulo}</h4>
                        <p style={{ fontSize: "0.88rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="Instrumentación" style={{ padding: "6rem 2rem", background: "rgba(99, 102, 241, 0.01)", borderTop: "1px solid rgba(99, 102, 241, 0.12)" }}>
              <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <SectionTitle uppercase>Módulos Físicos</SectionTitle>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "1rem", color: "#f8fafc" }}>Diseño y arquitectura del hardware embebido</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {COMPONENTES_HARDWARE.map((p) => (
                    <div key={p.nombre} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: 12, padding: "2.5rem", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={BadgeNumberStyle}>{p.num}</div>
                      <div style={{ flex: 1, minWidth: "290px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>{p.nombre}</h3>
                          <span style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255, 255, 255, 0.06)", padding: "4px 12px", borderRadius: 4, textTransform: "uppercase" }}>{p.tipo}</span>
                        </div>
                        <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.7, margin: "0 0 24px 0" }}>{p.desc}</p>
                        <div style={{ background: "rgba(5, 8, 22, 0.5)", padding: "1.5rem", borderRadius: 8, marginBottom: 20 }}>
                          <h4 style={{ fontSize: "0.85rem", color: "#f59e0b", margin: "0 0 16px 0", textTransform: "uppercase", fontWeight: 700 }}>Payload e Integración de Canales:</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                            {p.sensores.map(s => (
                              <div key={s.modelo} style={{ borderLeft: "2px solid rgba(245, 158, 11, 0.6)", paddingLeft: 12 }}>
                                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc" }}>{s.modelo}</div>
                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>{s.func}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="Arquitectura" style={{ padding: "6rem 2rem", borderTop: "1px solid rgba(99, 102, 241, 0.12)" }}>
              <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <SectionTitle uppercase>Flujo de Red e IP</SectionTitle>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "3.5rem", color: "#f8fafc" }}>Ecosistema de datos y persistencia temporal</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                  {ORQUESTACION_SOFTWARE.map((item, index) => (
                    <div key={index} style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(99, 102, 241, 0.12)", borderRadius: 8, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 10, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 700 }}>{item.etapa}</span>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 12px 0" }}>{item.titulo}</h3>
                        <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{item.detalle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="Resultados" style={{ padding: "6rem 2rem", background: "rgba(99, 102, 241, 0.01)", borderTop: "1px solid rgba(99, 102, 241, 0.12)" }}>
              <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <SectionTitle uppercase>Métricas de Campo</SectionTitle>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "4rem", color: "#f8fafc" }}>Validación incremental del sistema</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {METRICAS_VALIDADAS.map((m, index) => (
                    <div key={index} style={{ background: "rgba(5, 8, 20, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 8, padding: "24px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>{m.valor}</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{m.metrica}</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{m.contexto}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="Contacto" style={{ padding: "6rem 2rem", borderTop: "1px solid rgba(99, 102, 241, 0.12)" }}>
              <div style={{ maxWidth: 950, margin: "0 auto" }}>
                <SectionTitle uppercase>Cuerpo Técnico</SectionTitle>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "4rem", color: "#f8fafc" }}>Cátedra y división académica</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                  {INTEGRANTES.map((c) => (
                    <div key={c.nombre} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: 8, padding: "20px" }}>
                      <p style={{ fontWeight: 700, color: "#f8fafc", margin: "0 0 4px 0" }}>{c.nombre}</p>
                      <p style={{ fontSize: "0.82rem", color: "#f59e0b", fontFamily: "monospace" }}>Matrícula: {c.matricula}</p>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>{c.rol}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {mainView === "nodered" && (
          <div style={IframeWrapperStyle}>
            <div style={IframeHeaderStyle}>
              <span style={{ color: "#ef4444" }}>● Servidor de Flujos Detectado:</span> {NETWORK_TOPOLOGY.NODE_RED_SERVER}
            </div>
            <iframe src={NETWORK_TOPOLOGY.NODE_RED_SERVER} title="Node-RED Flow Broker Dashboard" style={IframeStyle} />
          </div>
        )}

        {mainView === "grafana" && (
          <div style={IframeWrapperStyle}>
            <div style={IframeHeaderStyle}>
              <span style={{ color: "#a855f7" }}>● Servidor Analítico Detectado:</span> {NETWORK_TOPOLOGY.GRAFANA_SERVER}
            </div>
            <iframe src={`${NETWORK_TOPOLOGY.GRAFANA_SERVER}/d/lumenia-analytics?orgId=1&refresh=2s&kiosk`} title="Grafana Analytics Suite" style={IframeStyle} />
          </div>
        )}

        {mainView === "influxdb" && (
          <div style={{ padding: "3rem 2rem", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", animation: "fadeIn 0.4s ease" }}>
            <SectionTitle uppercase>Time Series Database Server</SectionTitle>
            <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Terminal de Datos Históricos (InfluxDB)</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2.5rem" }}>
              Mapeo directo de la instancia remota alojada en el host analítico. Ejecución síncrona mediante lenguaje de consulta Flux.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", alignItems: "start" }}>
              <div style={{ background: "#050812", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: 6 }}>
                <h4 style={{ color: "#f59e0b", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>Flux Query Activa:</h4>
                <pre style={{ color: "#34d399", fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {`from(bucket: "Lumenia")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r["_measurement"] == "telemetria")\n  |> yield(name: "todo_el_historial")`}
                </pre>
                <div style={{ marginTop: "1.5rem", fontSize: "11px", color: "#64748b" }}>
                  Latencia de consulta: <span style={{ color: "#10b981", fontWeight: "bold" }}>0.01s</span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 8, padding: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 700 }}>Últimas Tramas JSON Recuperadas de la Instancia:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={TerminalRowStyle}><span style={{ color: "#f59e0b" }}>[2026-04-08 22:30:00]</span> {`{"luz": 100.00, "temp": 25.00, "pres": 810.00, "volt": 4.2, "ppm": 400}`}</div>
                  <div style={TerminalRowStyle}><span style={{ color: "#f59e0b" }}>[2026-04-08 22:25:00]</span> {`{"luz": 106.66, "temp": 24.80, "pres": 809.50, "volt": 4.1, "ppm": 402}`}</div>
                  <div style={TerminalRowStyle}><span style={{ color: "#f59e0b" }}>[2026-04-08 22:20:00]</span> {`{"luz": 115.30, "temp": 24.50, "pres": 809.10, "volt": 4.1, "ppm": 410}`}</div>
                  <div style={TerminalRowStyle}><span style={{ color: "#f59e0b" }}>[2026-04-08 22:15:00]</span> {`{"luz": 124.18, "temp": 24.10, "pres": 807.43, "volt": 4.0, "ppm": 415}`}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid rgba(99, 102, 241, 0.1)", padding: "2.5rem 2rem", textAlign: "center", color: "#475569", fontSize: "0.82rem", background: "rgba(5, 8, 18, 0.5)" }}>
        <span style={{ color: "#f59e0b", fontWeight: 600 }}>✦ FLDSMDFR</span> · Instituto Tecnológico Superior del Occidente del Estado de Hidalgo (ITSOEH) · Ingeniería en TIC's · 2026
      </footer>
    </div>
  );
}