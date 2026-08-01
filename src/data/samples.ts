import { SampleScenario } from '../types';

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'sample-factura',
    title: 'Factura Comercial - Servicios Cloud & Servidores',
    category: 'Factura / Finanzas',
    description: 'Factura A N° 0008-0004512 con detalle de infraestructura en la nube, licencias de software y soporte técnico.',
    iconName: 'Receipt',
    fileType: 'text',
    content: `FACTURA ELECTRÓNICA - TIPO A
N° 0008-0004512
FECHA: 15/07/2026
RAZÓN SOCIAL EMISOR: CloudTech Solutions S.A.
CUIT: 30-71458920-9
CLIENTE: Corporación Inversiones del Norte S.R.L.
CUIT CLIENTE: 30-68912344-2
CONDICIÓN DE PAGO: Factura 30 días (Vencimiento: 14/08/2026)

DETALLE DE CONCEPTOS:
1. Instancia Servidor Cloud GPU A100 (720 Horas): $2,400.00 USD
2. Almacenamiento SSD NVMe High-Speed 50TB: $750.00 USD
3. Licencias de Middleware Enterprise (10 Nodos): $1,200.00 USD
4. Servicio de Mantenimiento y Soporte Dedicado 24/7: $650.00 USD
5. Transferencia de Datos Egress (12 TB): $180.00 USD

SUBTOTAL: $5,180.00 USD
DESCUENTO APLICADO (Plan Anual -5%): -$259.00 USD
SUBTOTAL CON DESCUENTO: $4,921.00 USD
IVA (21%): $1,033.41 USD
IMPUESTOS MUNICIPALES Y RETENCIONES: $147.63 USD

TOTAL A PAGAR: $6,102.04 USD

NOTAS DE AUDITORÍA INTERNA:
- El costo de GPU aumentó un 18% respecto al mes anterior por cargas de entrenamiento LLM.
- La transferencia de datos superó la cuota mensual contratada en 2TB.`
  },
  {
    id: 'sample-investigacion',
    title: 'Informe de Investigación - Latencia y Eficiencia de Modelos IA',
    category: 'Investigación Académica',
    description: 'Estudio comparativo entre arquitecturas Transformer y Mamba en dispositivos edge con métricas de consumo de energía.',
    iconName: 'FileCode2',
    fileType: 'text',
    content: `UNIVERSIDAD NACIONAL DE INGENIERÍA - FACULTAD DE INFORMÁTICA
PROYECTO DE INVESTIGACIÓN Y DESARROLLO #2026-INV-04
TÍTULO: Evaluación Comparativa de Latencia, Throughput y Consumo Energético en Modelos GenAI Edge (Mamba vs Transformer)
AUTORES: Grupo de Investigación en Sistemas Distribuidos e Inteligencia Artificial

RESUMEN EJECUTIVO:
Se evaluaron 4 arquitecturas de procesamiento de lenguaje natural en hardware embebido (NVIDIA Jetson Orin Nano 8GB y Raspberry Pi 5 8GB). Se midieron 10,000 inferencias continuas bajo distintas longitudes de contexto (512, 2048, 8192 tokens).

RESULTADOS CLAVE DE LATENCIA (Primer Token / TTFT - Time To First Token):
- Modelo Transformer-1B (Jetson): Latencia Media 142 ms, Throughput 38 tok/s, Consumo 12.4W
- Modelo Transformer-3B (Jetson): Latencia Media 380 ms, Throughput 19 tok/s, Consumo 18.2W
- Modelo Mamba-StateSpace-1.4B (Jetson): Latencia Media 64 ms, Throughput 62 tok/s, Consumo 8.1W
- Modelo Mamba-StateSpace-2.8B (Jetson): Latencia Media 115 ms, Throughput 44 tok/s, Consumo 11.8W

RESULTADOS DE MEMORIA VRAM EN CONTEXTOS LARGOS (8192 Tokens):
- Transformer-3B: Consumo pico VRAM 7.4 GB (Riesgo OOM 92.5%)
- Mamba-2.8B: Consumo pico VRAM 3.1 GB (Eficiencia de memoria +58%)

TASA DE ACCURACY / EVALUACIÓN DE BENCHMARK (MMLU / GSM8K):
- Transformer-3B: MMLU 68.4%, GSM8K 62.1%
- Mamba-2.8B: MMLU 66.8%, GSM8K 60.5%

CONCLUSIONES CIENTÍFICAS:
1. Mamba ofrece un 121% más de throughput en tokens/segundo con un consumo de potencia 35% inferior.
2. Para entornos Edge con restricciones energéticas (baterías o robots móviles), Mamba es la arquitectura recomendada.
3. Para precisión matemática compleja, Transformer conserva una ventaja del 2.6% en GSM8K.`
  },
  {
    id: 'sample-empresa',
    title: 'Reporte Trimestral Q2 - Estado Financiero y Retención de Usuarios',
    category: 'Empresa / Negocios',
    description: 'Reporte ejecutivo de métricas de ingresos, Churn Rate, CAC y rendimiento de canales de adquisición.',
    iconName: 'TrendingUp',
    fileType: 'text',
    content: `REPORTE DE PERFORMANCE TRIMESTRAL Q2 - TECHMETRICS INC.
FECHA DE PUBLICACIÓN: Julio 2026
PREPARADO PARA: Junta Directiva y Equipo Ejecutivo

RESUMEN GENERAL DE INGRESOS (ARR & MRR):
- Ingreso Mensual Recurrente (MRR) Junio 2026: $148,500 USD (Crecimiento +14.2% MoM)
- Ingreso Anual Recurrente (ARR): $1,782,000 USD
- Ingresos Totales acumulados Q2: $421,000 USD (Meta del trimestre: $400,000 USD - Cumplimiento 105.25%)

MÉTRICAS DE CLIENTES Y RETENCIÓN:
- Usuarios Activos Mensuales (MAU): 42,800
- Nuevos Clientes de Pago en Q2: 620
- Tasa de Abandono (Monthly Churn Rate): 2.1% (Reducción respecto al 3.4% en Q1)
- Costo de Adquisición de Cliente (CAC): $215 USD
- Valor de Vida del Cliente (LTV): $2,850 USD
- Ratio LTV/CAC: 13.2x (Saludable > 3x)

DESGLOSE DE INGRESOS POR PLAN DE SUSCRIPCIÓN:
- Plan Basic ($29/mes): 1,200 suscriptores -> $34,800 MRR (23.4%)
- Plan Pro ($99/mes): 750 suscriptores -> $74,250 MRR (50.0%)
- Plan Enterprise ($499/mes): 78 suscriptores -> $38,922 MRR (26.2%)
- Servicios Adicionales (Consultoría / Setup): $528 MRR (0.4%)

DISTRIBUCIÓN DE COSTOS OPERATIVOS Q2:
- Infraestructura Cloud & Servidores: $68,000 USD (16.1%)
- Nómina de Ingeniería y Producto: $185,000 USD (43.9%)
- Marketing & Adquisición Paid: $72,000 USD (17.1%)
- Ventas y Operaciones: $45,000 USD (10.7%)
- Margen Neto Antes de Impuestos: $51,000 USD (12.1%)

OPORTUNIDADES DE EXPANSIÓN Y RIESGOS DICIEMBRE:
- Oportunidad: El plan Pro tiene la tasa de conversión más alta (8.4% desde prueba gratuita).
- Riesgo: La infraestructura cloud aumentó un 22% por consultas de búsqueda con Inteligencia Artificial. Se recomienda optimización de caché.`
  }
];
