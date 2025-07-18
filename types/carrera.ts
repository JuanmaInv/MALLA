export interface Materia {
  id: number
  nombre: string
  correlativasParaCursar: number[] // IDs of subjects that must be 'aprobada' to CURSAR this subject
  correlativasParaRendir: number[] // IDs of subjects that must be 'aprobada' to RENDIR FINAL of this subject
  año: number
  cuatrimestre: number
  creditos?: number
  tipo?: "obligatoria" | "electiva" | "practica"
}

export interface Carrera {
  id: string
  nombre: string
  universidad: string
  añoInicio: number
  duracionAños: number
  materias: Materia[]
  fechaCreacion: string
  fechaModificacion: string
}

export type EstadoMateria = "no-cursada" | "cursando" | "regular" | "aprobada"

export interface ProgresoMateria {
  id: number
  estado: EstadoMateria
  fechaActualizacion: string
  nota?: number
}

export interface ProgresoCarrera {
  carreraId: string
  progreso: Map<number, ProgresoMateria>
  fechaActualizacion: string
}
