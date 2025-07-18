"use client"

import { useState, useEffect } from "react"
import type { Carrera } from "@/types/carrera"

// Helper para crear materias con ambas correlativas a partir de una sola lista
// Por defecto, las correlativas para cursar y rendir son las mismas.
// Esto se puede ajustar manualmente en el editor si una materia tiene reglas diferentes.
const createMateria = (
  id: number,
  nombre: string,
  correlativas: number[], // This list will be used for both cursar and rendir by default
  año: number,
  cuatrimestre: number,
  tipo: "obligatoria" | "electiva" | "practica",
) => ({
  id,
  nombre,
  correlativasParaCursar: correlativas,
  correlativasParaRendir: correlativas,
  año,
  cuatrimestre,
  tipo,
})

const CARRERAS_PREDEFINIDAS: Carrera[] = [
  {
    id: "ing-sistemas-ucp-2023",
    nombre: "Ingeniería en Sistemas de Información",
    universidad: "UCP",
    añoInicio: 2023,
    duracionAños: 5,
    fechaCreacion: "2024-01-01",
    fechaModificacion: "2024-01-01",
    materias: [
      // Primer Año - 1º Cuatrimestre
      createMateria(1, "Álgebra y Lógica Computacional", [], 1, 1, "obligatoria"),
      createMateria(2, "Introducción a la Informática", [], 1, 1, "obligatoria"),
      createMateria(3, "Química General", [], 1, 1, "obligatoria"),
      createMateria(4, "Sistemas y Organizaciones", [], 1, 1, "obligatoria"),
      createMateria(5, "Inglés", [], 1, 1, "obligatoria"),

      // Primer Año - 2º Cuatrimestre
      createMateria(6, "Análisis Matemático I", [1], 1, 2, "obligatoria"),
      createMateria(7, "Arquitectura de Computadoras", [2], 1, 2, "obligatoria"),
      createMateria(8, "Programación Estructurada", [2], 1, 2, "obligatoria"),
      createMateria(9, "Matemática Discreta", [1], 1, 2, "obligatoria"),

      // Segundo Año - 1º Cuatrimestre
      createMateria(10, "Análisis Matemático II", [6], 2, 1, "obligatoria"),
      createMateria(11, "Física I", [6], 2, 1, "obligatoria"),
      createMateria(12, "Paradigmas y Lenguajes de Programación I", [8], 2, 1, "obligatoria"),
      createMateria(13, "Ingeniería de Software I", [4, 8], 2, 1, "obligatoria"),

      // Segundo Año - 2º Cuatrimestre
      createMateria(14, "Sistemas de Representación", [], 2, 2, "obligatoria"),
      createMateria(15, "Portugués", [], 2, 2, "obligatoria"),
      createMateria(16, "Física II", [11], 2, 2, "obligatoria"),
      createMateria(17, "Paradigmas y Lenguajes de Programación II", [12], 2, 2, "obligatoria"),
      createMateria(18, "Sistemas Operativos", [7], 2, 2, "obligatoria"),

      // Tercer Año - 1º Cuatrimestre
      createMateria(19, "Probabilidad y Estadísticas", [9, 10], 3, 1, "obligatoria"),
      createMateria(20, "Análisis Numérico", [10], 3, 1, "obligatoria"),
      createMateria(21, "Comunicaciones", [16, 18], 3, 1, "obligatoria"),
      createMateria(22, "Ingeniería de Software II", [13], 3, 1, "obligatoria"),
      createMateria(23, "Economía y Costos", [4], 3, 1, "obligatoria"),

      // Tercer Año - 2º Cuatrimestre
      createMateria(24, "Paradigmas y Lenguajes de Programación III", [17], 3, 2, "obligatoria"),
      createMateria(25, "Investigación Operativa", [9, 10], 3, 2, "obligatoria"),
      createMateria(26, "Redes de Datos", [21], 3, 2, "obligatoria"),
      createMateria(27, "Gestión de Empresas", [23], 3, 2, "obligatoria"),
      createMateria(28, "Base de Datos", [22], 3, 2, "obligatoria"),

      // Cuarto Año - 1º Cuatrimestre
      createMateria(29, "Modelo y Simulación", [25], 4, 1, "obligatoria"),
      createMateria(30, "Ingeniería de Software III", [22], 4, 1, "obligatoria"),
      createMateria(31, "Teoría de la Computación", [17], 4, 1, "obligatoria"),
      createMateria(32, "Desarrollo Multimedia", [24], 4, 1, "obligatoria"),
      createMateria(33, "Tecnología, Ciencia y Responsabilidad Social", [27], 4, 1, "obligatoria"),

      // Cuarto Año - 2º Cuatrimestre
      createMateria(34, "Formulación y Evaluación de Proyectos", [22, 27], 4, 2, "obligatoria"),
      createMateria(35, "Gestión Avanzada de Base de Datos", [28], 4, 2, "obligatoria"),
      createMateria(36, "Diseño y Desarrollo de Videojuegos", [22, 32], 4, 2, "electiva"),
      createMateria(37, "Auditoría y Seguridad de la Información", [26], 4, 2, "obligatoria"),
      createMateria(38, "Sistemas Operativos Distribuidos", [26], 4, 2, "obligatoria"),

      // Quinto Año - 1º Cuatrimestre
      createMateria(39, "Tópicos Avanzados de Redes de Datos y Servicios", [37, 38], 5, 1, "obligatoria"),
      createMateria(40, "Gestión de Proyectos", [22, 30], 5, 1, "obligatoria"),
      createMateria(41, "Sistemas Inteligentes", [29, 31], 5, 1, "obligatoria"),
      createMateria(42, "Práctica Profesional Supervisada I", [26, 28, 30, 33], 5, 1, "practica"),
      createMateria(43, "Planificación de Sistemas de Información para Negocios", [30, 34], 5, 1, "obligatoria"),

      // Quinto Año - 2º Cuatrimestre
      createMateria(44, "Sistemas de Información Geográfica", [20, 24, 28, 30], 5, 2, "electiva"),
      createMateria(45, "Derecho y Ética Profesional", [33], 5, 2, "obligatoria"),
      createMateria(46, "Práctica Profesional Supervisada II", [35, 42], 5, 2, "practica"),
      createMateria(47, "Proyecto Final de Grado", [34, 37, 38, 42], 5, 2, "practica"),
    ],
  },
]

export function useCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [carreraActual, setCarreraActual] = useState<string | null>(null)

  useEffect(() => {
    const carrerasGuardadas = localStorage.getItem("malla-carreras")
    const carreraActualGuardada = localStorage.getItem("malla-carrera-actual")

    if (carrerasGuardadas) {
      try {
        const parsed = JSON.parse(carrerasGuardadas)
        setCarreras([...CARRERAS_PREDEFINIDAS, ...parsed])
      } catch {
        setCarreras(CARRERAS_PREDEFINIDAS)
      }
    } else {
      setCarreras(CARRERAS_PREDEFINIDAS)
    }

    if (carreraActualGuardada) {
      setCarreraActual(carreraActualGuardada)
    } else {
      setCarreraActual(CARRERAS_PREDEFINIDAS[0].id)
    }
  }, [])

  const guardarCarreras = (nuevasCarreras: Carrera[]) => {
    const carrerasPersonalizadas = nuevasCarreras.filter((c) => !CARRERAS_PREDEFINIDAS.find((p) => p.id === c.id))
    localStorage.setItem("malla-carreras", JSON.stringify(carrerasPersonalizadas))
    setCarreras(nuevasCarreras)
  }

  const cambiarCarreraActual = (carreraId: string) => {
    localStorage.setItem("malla-carrera-actual", carreraId)
    setCarreraActual(carreraId)
  }

  const agregarCarrera = (carrera: Carrera) => {
    const nuevasCarreras = [...carreras, carrera]
    guardarCarreras(nuevasCarreras)
  }

  const actualizarCarrera = (carrera: Carrera) => {
    const nuevasCarreras = carreras.map((c) => (c.id === carrera.id ? carrera : c))
    guardarCarreras(nuevasCarreras)
  }

  const eliminarCarrera = (carreraId: string) => {
    const nuevasCarreras = carreras.filter((c) => c.id !== carreraId)
    guardarCarreras(nuevasCarreras)
    if (carreraActual === carreraId && nuevasCarreras.length > 0) {
      cambiarCarreraActual(nuevasCarreras[0].id)
    } else if (carreraActual === carreraId && nuevasCarreras.length === 0) {
      setCarreraActual(null)
    }
  }

  return {
    carreras,
    carreraActual,
    cambiarCarreraActual,
    agregarCarrera,
    actualizarCarrera,
    eliminarCarrera,
    getCarreraActual: () => carreras.find((c) => c.id === carreraActual),
  }
}
