import type { EcoReporte } from "@/lib/eco/types";

/**
 * Reporte ECO generado el 11 de junio de 2026.
 *
 * IMPORTANTE: este reporte aglomera DOS audiencias en un mismo diagnóstico:
 *   - SIMCO   = personal corporativo
 *   - CONCEPTS = personal operativo de restaurantes (Batbox + Mulligans)
 *
 * Los % son el promedio combinado de ambos grupos. Si en el futuro Potentor
 * entrega los reportes separados (uno por audiencia), modelar cada uno como
 * archivo distinto y armar la vista comparativa.
 *
 * Fuente: /Users/macbook/Downloads/Diagnóstico de Clima Organizacional.pdf
 *         https://campus.potentor.com.mx/eco/reporte/133
 *
 * Captura manual desde el PDF (no hay endpoint REST que entregue estos datos).
 */
export const ecoReporte202606Simco: EcoReporte = {
  id: "eco-2026-06-grupo",
  titulo: "ECO Junio 2026 — SIMCO + CONCEPTS",
  organizacion: "SIMCO + CONCEPTS",
  fecha: "2026-06-11",
  year: 2026,
  month: 6,
  indiceGlobal: 76,
  urlPotentor: "https://campus.potentor.com.mx/eco/reporte/133",
  macrodimensiones: [
    {
      nombre: "Filosofía corporativa",
      score: 79,
      subdimensiones: [
        {
          nombre: "Principios y valores",
          score: 81,
          items: [
            {
              texto:
                "Los principios y valores de la organización empatan con el código moral.",
              dist: { op1: 46.34, op2: 43.9, op3: 9.76, op4: 0 },
              score: 84.15,
            },
            {
              texto:
                "Los valores de la organización están presentes en el día a día.",
              dist: { op1: 29.27, op2: 39.02, op3: 31.71, op4: 0 },
              score: 74.39,
            },
            {
              texto:
                "El código de ética y los valores de la organización son conocidos por los colaboradores.",
              dist: { op1: 43.9, op2: 41.46, op3: 14.63, op4: 0 },
              score: 82.32,
            },
            {
              texto: "La misión de la organización es clara.",
              dist: { op1: 41.46, op2: 43.9, op3: 14.63, op4: 0 },
              score: 81.71,
            },
          ],
        },
        {
          nombre: "Política organizacional",
          score: 78,
          items: [
            {
              texto: "Las políticas internas de la organización son claras.",
              dist: { op1: 21.95, op2: 60.98, op3: 17.07, op4: 0 },
              score: 76.22,
            },
            {
              texto:
                "Los colaboradores son conscientes de las consecuencias de no cumplir con las políticas.",
              dist: { op1: 56.1, op2: 43.9, op3: 0, op4: 0 },
              score: 89.02,
            },
            {
              texto:
                "Las políticas de la organización dan claridad para resolver asuntos y ser productivos.",
              dist: { op1: 26.83, op2: 46.34, op3: 24.39, op4: 2.44 },
              score: 74.39,
            },
            {
              texto:
                "Cuando se crea o actualiza una política los empleados reciben la información a tiempo.",
              dist: { op1: 21.95, op2: 41.46, op3: 34.15, op4: 2.44 },
              score: 70.73,
            },
          ],
        },
      ],
    },
    {
      nombre: "Cultura laboral",
      score: 75,
      subdimensiones: [
        {
          nombre: "Ambiente Laboral",
          score: 75,
          items: [
            {
              texto:
                "El lugar de trabajo permite a los colaboradores realizar actividades de manera segura e higiénica.",
              dist: { op1: 29.27, op2: 56.1, op3: 12.2, op4: 2.44 },
              score: 78.05,
            },
            {
              texto:
                "Dentro de los puestos de trabajo es posible balancear responsabilidades laborales y personales.",
              dist: { op1: 29.27, op2: 51.22, op3: 19.51, op4: 0 },
              score: 77.44,
            },
            {
              texto: "La organización promueve un buen ambiente laboral.",
              dist: { op1: 29.27, op2: 53.66, op3: 14.63, op4: 2.44 },
              score: 77.44,
            },
            {
              texto:
                "La organización apoya el balance entre el trabajo y la vida personal.",
              dist: { op1: 34.15, op2: 39.02, op3: 24.39, op4: 2.44 },
              score: 76.22,
            },
            {
              texto: "En el trabajo se aplican normas de seguridad.",
              dist: { op1: 12.2, op2: 63.41, op3: 21.95, op4: 2.44 },
              score: 71.34,
            },
            {
              texto:
                "En la organización se valora a los colaboradores como personas.",
              dist: { op1: 26.83, op2: 48.78, op3: 24.39, op4: 0 },
              score: 75.61,
            },
            {
              texto:
                "En la organización se ofrecen actividades culturales, de recreación y/o deportivas que apoyan el desarrollo.",
              dist: { op1: 24.39, op2: 46.34, op3: 26.83, op4: 2.44 },
              score: 73.17,
            },
            {
              texto:
                "Existen medidas preventivas para evitar los accidentes en el trabajo.",
              dist: { op1: 14.63, op2: 48.78, op3: 36.59, op4: 0 },
              score: 69.51,
            },
          ],
        },
        {
          nombre: "Colaboración",
          score: 76,
          items: [
            {
              texto:
                "La organización fomenta un ambiente de colaboración entre los empleados.",
              dist: { op1: 34.15, op2: 48.78, op3: 14.63, op4: 2.44 },
              score: 78.66,
            },
            {
              texto:
                "La organización cuenta con suficientes reuniones para determinar áreas de mejora y soluciones.",
              dist: { op1: 17.07, op2: 53.66, op3: 26.83, op4: 2.44 },
              score: 71.34,
            },
            {
              texto: "Existen espacios para colaborar y/o compartir ideas.",
              dist: { op1: 26.83, op2: 46.34, op3: 26.83, op4: 0 },
              score: 75,
            },
            {
              texto:
                "Existe una tendencia de colaboración efectiva dentro de los equipos de trabajo.",
              dist: { op1: 14.63, op2: 58.54, op3: 24.39, op4: 2.44 },
              score: 71.34,
            },
            {
              texto:
                "En la organización se promueve el intercambio de conocimientos y/o experiencias entre los colaboradores.",
              dist: { op1: 26.83, op2: 53.66, op3: 17.07, op4: 2.44 },
              score: 76.22,
            },
            {
              texto:
                "Cuando se necesita información para realizar tareas, se encuentra el apoyo entre compañeros de trabajo.",
              dist: { op1: 39.02, op2: 43.9, op3: 17.07, op4: 0 },
              score: 80.49,
            },
          ],
        },
        {
          nombre: "Compromiso",
          score: 72,
          items: [
            {
              texto:
                "Los colaboradores se sienten orgullosos de ser parte de esta organización.",
              dist: { op1: 58.54, op2: 34.15, op3: 7.32, op4: 0 },
              score: 87.8,
            },
            {
              texto:
                "Los equipos de trabajo consideran que la organización es responsable.",
              dist: { op1: 19.51, op2: 56.1, op3: 24.39, op4: 0 },
              score: 73.78,
            },
            {
              texto:
                "La organización cumple lo que promete a sus colaboradores.",
              dist: { op1: 7.32, op2: 43.9, op3: 41.46, op4: 7.32 },
              score: 62.8,
            },
            {
              texto:
                "La calidad moral de los que laboran en esta organización es buena.",
              dist: { op1: 21.95, op2: 51.22, op3: 26.83, op4: 0 },
              score: 73.78,
            },
            {
              texto:
                "La rotación del personal dentro de la organización es la adecuada.",
              dist: { op1: 9.76, op2: 43.9, op3: 36.59, op4: 9.76 },
              score: 63.41,
            },
          ],
        },
        {
          nombre: "Reconocimiento",
          score: 75,
          items: [
            {
              texto:
                "En la organización se reconoce el trabajo efectivo de los empleados.",
              dist: { op1: 17.07, op2: 36.59, op3: 43.9, op4: 2.44 },
              score: 67.07,
            },
            {
              texto:
                "Las buenas ideas propuestas se reconocen cuando se amerita.",
              dist: { op1: 31.71, op2: 41.46, op3: 26.83, op4: 0 },
              score: 76.22,
            },
            {
              texto:
                "Los líderes reconocen el esfuerzo y/o buen desempeño.",
              dist: { op1: 48.78, op2: 31.71, op3: 14.63, op4: 4.88 },
              score: 81.1,
            },
          ],
        },
      ],
    },
    {
      nombre: "Comunicación interna",
      score: 72,
      subdimensiones: [
        {
          nombre: "Estrategia de comunicación",
          score: 72,
          items: [
            {
              texto:
                "Existe una estrategia de comunicación interna en la que se transmiten los mensajes clave a los colaboradores.",
              dist: { op1: 14.63, op2: 63.41, op3: 19.51, op4: 2.44 },
              score: 72.56,
            },
            {
              texto:
                "Se considera que las juntas presenciales/virtuales son efectivas.",
              dist: { op1: 19.51, op2: 51.22, op3: 24.39, op4: 4.88 },
              score: 71.34,
            },
            {
              texto: "Los comunicados internos son efectivos y oportunos.",
              dist: { op1: 24.39, op2: 48.78, op3: 21.95, op4: 4.88 },
              score: 73.17,
            },
          ],
        },
        {
          nombre: "Franqueza",
          score: 72,
          items: [
            {
              texto:
                "Es posible reportar prácticas no éticas sin temor a consecuencias.",
              dist: { op1: 19.51, op2: 43.9, op3: 26.83, op4: 9.76 },
              score: 68.29,
            },
            {
              texto:
                "La organización cuenta con la denuncia anónima por casos de hostigamiento o violencia física.",
              dist: { op1: 12.2, op2: 39.02, op3: 41.46, op4: 7.32 },
              score: 64.02,
            },
            {
              texto: "Se pueden expresar ideas sin temor.",
              dist: { op1: 51.22, op2: 31.71, op3: 14.63, op4: 2.44 },
              score: 82.93,
            },
          ],
        },
      ],
    },
    {
      nombre: "Equipo de trabajo",
      score: 81,
      subdimensiones: [
        {
          nombre: "Eficiencia",
          score: 77,
          items: [
            {
              texto: "Los equipos de trabajo utilizan procesos eficientes.",
              dist: { op1: 29.27, op2: 58.54, op3: 12.2, op4: 0 },
              score: 79.27,
            },
            {
              texto:
                "Los equipos cuentan con las herramientas y/o tecnologías necesarias para realizar el trabajo.",
              dist: { op1: 19.51, op2: 46.34, op3: 31.71, op4: 2.44 },
              score: 70.73,
            },
            {
              texto:
                "Los equipos cuentan con procedimientos claros para llevar a cabo las tareas.",
              dist: { op1: 39.02, op2: 39.02, op3: 14.63, op4: 7.32 },
              score: 77.44,
            },
            {
              texto:
                "Los equipos tienden a integrar a personas capaces para realizar las tareas encomendadas.",
              dist: { op1: 39.02, op2: 39.02, op3: 21.95, op4: 0 },
              score: 79.27,
            },
          ],
        },
        {
          nombre: "Equipo de trabajo",
          score: 80,
          items: [
            {
              texto:
                "Los roles y responsabilidades de los equipos están bien definidos.",
              dist: { op1: 39.02, op2: 39.02, op3: 14.63, op4: 7.32 },
              score: 77.44,
            },
            {
              texto:
                "Los problemas de trabajo se resuelven en forma respetuosa y cooperativa.",
              dist: { op1: 24.39, op2: 53.66, op3: 14.63, op4: 7.32 },
              score: 73.78,
            },
            {
              texto:
                "Dentro de los equipos de trabajo se puede compartir y proponer ideas.",
              dist: { op1: 58.54, op2: 34.15, op3: 7.32, op4: 0 },
              score: 87.8,
            },
          ],
        },
        {
          nombre: "Soporte de jefe directo",
          score: 81,
          items: [
            {
              texto:
                "Los líderes apoyan el balance que debe existir entre el trabajo y la vida personal.",
              dist: { op1: 46.34, op2: 36.59, op3: 12.2, op4: 4.88 },
              score: 81.1,
            },
            {
              texto:
                "Los líderes supervisan las actividades, pero dan libertad para desarrollar el trabajo.",
              dist: { op1: 41.46, op2: 46.34, op3: 9.76, op4: 2.44 },
              score: 81.71,
            },
            {
              texto:
                "Los líderes brindan retroalimentación u orientación para realizar mejor el trabajo.",
              dist: { op1: 41.46, op2: 41.46, op3: 14.63, op4: 2.44 },
              score: 80.49,
            },
            {
              texto:
                "Los jefes de equipos dan autonomía para tomar decisiones oportunas en el cumplimiento de las responsabilidades.",
              dist: { op1: 46.34, op2: 41.46, op3: 4.88, op4: 7.32 },
              score: 81.71,
            },
            {
              texto:
                "Los líderes reconocen cuando se logran objetivos de trabajo.",
              dist: { op1: 41.46, op2: 46.34, op3: 7.32, op4: 4.88 },
              score: 81.1,
            },
          ],
        },
        {
          nombre: "Apertura de jefe directo",
          score: 85,
          items: [
            {
              texto: "Los líderes de equipo son respetuosos.",
              dist: { op1: 70.73, op2: 19.51, op3: 9.76, op4: 0 },
              score: 90.24,
            },
            {
              texto:
                "Los jefes de equipos tienen una actitud abierta respecto a los puntos de vista, y los toman en cuenta.",
              dist: { op1: 46.34, op2: 41.46, op3: 9.76, op4: 2.44 },
              score: 82.93,
            },
            {
              texto:
                "Los líderes de la organización cuentan con el conocimiento y las habilidades necesarias para desempeñar su puesto.",
              dist: { op1: 41.46, op2: 46.34, op3: 9.76, op4: 2.44 },
              score: 81.71,
            },
            {
              texto:
                "Los líderes de la organización interactúan con el equipo cuando es necesario.",
              dist: { op1: 58.54, op2: 31.71, op3: 7.32, op4: 2.44 },
              score: 86.59,
            },
          ],
        },
      ],
    },
    {
      nombre: "Trabajo y carrera",
      score: 71,
      subdimensiones: [
        {
          nombre: "Estructura organizacional",
          score: 71,
          items: [
            {
              texto:
                "Los cambios que surgen en la estructura organizacional son comunicados claramente.",
              dist: { op1: 12.2, op2: 43.9, op3: 36.59, op4: 7.32 },
              score: 65.24,
            },
            {
              texto: "La estructura organizacional de la entidad es clara.",
              dist: { op1: 29.27, op2: 58.54, op3: 12.2, op4: 0 },
              score: 79.27,
            },
            {
              texto:
                "La estructura organizacional está claramente expuesta en organigramas.",
              dist: { op1: 14.63, op2: 48.78, op3: 34.15, op4: 2.44 },
              score: 68.9,
            },
          ],
        },
        {
          nombre: "Compensaciones",
          score: 75,
          items: [
            {
              texto:
                "Los sueldos, de acuerdo con el trabajo realizado, son justos.",
              dist: { op1: 12.2, op2: 39.02, op3: 46.34, op4: 2.44 },
              score: 65.24,
            },
            {
              texto:
                "La organización otorga prestaciones y beneficios competitivos con el mercado.",
              dist: { op1: 12.2, op2: 39.02, op3: 31.71, op4: 17.07 },
              score: 61.59,
            },
            {
              texto: "El salario se paga a tiempo.",
              dist: { op1: 90.24, op2: 7.32, op3: 2.44, op4: 0 },
              score: 96.95,
            },
          ],
        },
        {
          nombre: "Crecimiento laboral",
          score: 71,
          items: [
            {
              texto: "Las promociones tienden a ser justas.",
              dist: { op1: 17.07, op2: 43.9, op3: 31.71, op4: 7.32 },
              score: 67.68,
            },
            {
              texto:
                "Dentro de esta organización es posible desarrollarse y tener una carrera exitosa.",
              dist: { op1: 19.51, op2: 58.54, op3: 17.07, op4: 4.88 },
              score: 73.17,
            },
          ],
        },
        {
          nombre: "Cambios organizacionales",
          score: 69,
          items: [
            {
              texto:
                "Los cambios organizacionales que se han presentado tienden a facilitar el trabajo de los colaboradores.",
              dist: { op1: 14.63, op2: 56.1, op3: 24.39, op4: 4.88 },
              score: 70.12,
            },
            {
              texto:
                "Cuando se presenta un cambio organizacional se recibe la información adecuada y a tiempo.",
              dist: { op1: 7.32, op2: 53.66, op3: 36.59, op4: 2.44 },
              score: 66.46,
            },
            {
              texto:
                "Los cambios organizacionales que se realizan son coherentes con la filosofía de la organización.",
              dist: { op1: 9.76, op2: 63.41, op3: 21.95, op4: 4.88 },
              score: 69.51,
            },
          ],
        },
      ],
    },
    {
      nombre: "Autogestión",
      score: 80,
      subdimensiones: [
        {
          nombre: "Alcance de puesto",
          score: 83,
          items: [
            {
              texto:
                "Las responsabilidades dentro de los puestos de trabajo son claras.",
              dist: { op1: 48.78, op2: 39.02, op3: 9.76, op4: 2.44 },
              score: 83.54,
            },
            {
              texto:
                "Se conocen las consecuencias de los errores que se puedan llegar a conocer en los puestos de trabajo.",
              dist: { op1: 53.66, op2: 43.9, op3: 2.44, op4: 0 },
              score: 87.8,
            },
            {
              texto:
                "Se presentan oportunidades en las que los colaboradores pueden crecer y desarrollarse.",
              dist: { op1: 31.71, op2: 41.46, op3: 24.39, op4: 2.44 },
              score: 75.61,
            },
            {
              texto:
                "Los líderes de la organización dan libertad de acción.",
              dist: { op1: 51.22, op2: 34.15, op3: 9.76, op4: 4.88 },
              score: 82.93,
            },
          ],
        },
        {
          nombre: "Autonomía",
          score: 78,
          items: [
            {
              texto:
                "En esta organización es posible tener iniciativa en el manejo del propio puesto.",
              dist: { op1: 19.51, op2: 58.54, op3: 21.95, op4: 0 },
              score: 74.39,
            },
            {
              texto: "Hay estabilidad dentro de los puestos de trabajo.",
              dist: { op1: 29.27, op2: 63.41, op3: 7.32, op4: 0 },
              score: 80.49,
            },
            {
              texto:
                "La retroalimentación es un elemento constante en la organización.",
              dist: { op1: 19.51, op2: 43.9, op3: 36.59, op4: 0 },
              score: 70.73,
            },
            {
              texto:
                "El trabajo que realizan los colaboradores generalmente los mantiene motivados.",
              dist: { op1: 26.83, op2: 56.1, op3: 14.63, op4: 2.44 },
              score: 76.83,
            },
            {
              texto:
                "Los líderes de equipo son personas que confían en la capacidad de sus colaboradores.",
              dist: { op1: 53.66, op2: 39.02, op3: 4.88, op4: 2.44 },
              score: 85.98,
            },
          ],
        },
      ],
    },
  ],
};
