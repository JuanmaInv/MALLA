"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  Circle,
  Lock,
  RotateCcw,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Download,
  Share2,
  GraduationCap,
} from "lucide-react"
import { useCarreras } from "@/hooks/useCarreras"
import { EditorCarrera } from "@/components/editor-carrera"
import type { Carrera, EstadoMateria, Materia, ProgresoMateria } from "@/types/carrera"

export default function MallaCurricular() {
  const {
    carreras,
    carreraActual,
    cambiarCarreraActual,
    agregarCarrera,
    actualizarCarrera,
    eliminarCarrera,
    getCarreraActual,
  } = useCarreras()
  const [progresoMaterias, setProgresoMaterias] = useState<Map<number, ProgresoMateria>>(new Map())
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true)
  const [mostrarEditor, setMostrarEditor] = useState(false)
  const [carreraEditando, setCarreraEditando] = useState<Carrera | undefined>()
  const [instalacionDisponible, setInstalacionDisponible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const carrera = getCarreraActual()

  // PWA Installation
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setInstalacionDisponible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const instalarApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setInstalacionDisponible(false)
    }
    setDeferredPrompt(null)
  }

  // Cargar progreso específico de la carrera
  useEffect(() => {
    if (!carreraActual) return

    try {
      const saved = localStorage.getItem(`malla-progreso-${carreraActual}`)
      if (saved) {
        const data = JSON.parse(saved) as ProgresoMateria[]
        const mapaProgreso = new Map<number, ProgresoMateria>()
        data.forEach((progreso) => {
          mapaProgreso.set(progreso.id, progreso)
        })
        setProgresoMaterias(mapaProgreso)
      } else {
        setProgresoMaterias(new Map())
      }
    } catch (error) {
      console.error("Error al cargar el progreso:", error)
      setProgresoMaterias(new Map())
    }
  }, [carreraActual])

  // Guardar progreso específico de la carrera
  useEffect(() => {
    if (!carreraActual) return

    try {
      const data = Array.from(progresoMaterias.values())
      localStorage.setItem(`malla-progreso-${carreraActual}`, JSON.stringify(data))
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }
  }, [progresoMaterias, carreraActual])

  const actualizarEstadoMateria = (id: number, nuevoEstado: EstadoMateria) => {
    const nuevoProgreso = new Map(progresoMaterias)

    if (nuevoEstado === "no-cursada") {
      nuevoProgreso.delete(id)
    } else {
      nuevoProgreso.set(id, {
        id,
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString(),
      })
    }

    setProgresoMaterias(nuevoProgreso)
  }

  const getEstadoMateria = (id: number): EstadoMateria => {
    return progresoMaterias.get(id)?.estado || "no-cursada"
  }

  const puedeCursarMateria = (materia: Materia): boolean => {
    return materia.correlativasParaCursar.every((correlativaId) => {
      const estado = getEstadoMateria(correlativaId)
      // Para cursar, la correlativa debe estar al menos regular o aprobada
      return estado === "regular" || estado === "aprobada"
    })
  }

  const puedeRendirFinalMateria = (materia: Materia): boolean => {
    return materia.correlativasParaRendir.every((correlativaId) => {
      const estado = getEstadoMateria(correlativaId)
      // Para rendir final, la correlativa debe estar aprobada
      return estado === "aprobada"
    })
  }

  const getDisponibilidadMateria = (
    materia: Materia,
  ): "aprobada" | "regular" | "cursando" | "disponible" | "bloqueada" => {
    const estadoActual = getEstadoMateria(materia.id)

    if (estadoActual === "aprobada") return "aprobada"
    if (estadoActual === "regular") return "regular"
    if (estadoActual === "cursando") return "cursando"

    if (puedeCursarMateria(materia)) return "disponible"

    return "bloqueada"
  }

  const handleClickMateria = (materia: Materia) => {
    const estadoActual = getEstadoMateria(materia.id)
    const disponibilidad = getDisponibilidadMateria(materia)

    // No se puede interactuar con materias bloqueadas
    if (disponibilidad === "bloqueada") return

    switch (estadoActual) {
      case "no-cursada":
        // Solo se puede pasar a 'cursando' si está disponible
        if (disponibilidad === "disponible") {
          actualizarEstadoMateria(materia.id, "cursando")
        }
        break
      case "cursando":
        // De 'cursando' se pasa a 'regular'
        actualizarEstadoMateria(materia.id, "regular")
        break
      case "regular":
        // De 'regular' se pasa a 'aprobada'
        actualizarEstadoMateria(materia.id, "aprobada")
        break
      case "aprobada":
        // De 'aprobada' se vuelve a 'no-cursada' (reset)
        actualizarEstadoMateria(materia.id, "no-cursada")
        break
    }
  }

  const getColorMateria = (disponibilidad: string): string => {
    switch (disponibilidad) {
      case "aprobada":
        return "bg-green-100 border-green-500 text-green-800 hover:bg-green-200"
      case "regular":
        return "bg-orange-100 border-orange-500 text-orange-800 hover:bg-orange-200"
      case "cursando":
        return "bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200"
      case "disponible":
        return "bg-blue-100 border-blue-500 text-blue-800 hover:bg-blue-200"
      case "bloqueada":
        return "bg-gray-100 border-gray-300 text-gray-500"
      default:
        return "bg-white border-gray-200"
    }
  }

  const getIcono = (disponibilidad: string) => {
    switch (disponibilidad) {
      case "aprobada":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "regular":
        return <GraduationCap className="h-5 w-5 text-orange-600" />
      case "cursando":
        return <BookOpen className="h-5 w-5 text-yellow-600" />
      case "disponible":
        return <Circle className="h-5 w-5 text-blue-600" />
      case "bloqueada":
        return <Lock className="h-5 w-5 text-gray-400" />
      default:
        return <Circle className="h-5 w-5" />
    }
  }

  const resetearProgreso = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres resetear todo el progreso de esta carrera? Esta acción no se puede deshacer.",
      )
    ) {
      setProgresoMaterias(new Map())
      if (carreraActual) {
        localStorage.removeItem(`malla-progreso-${carreraActual}`)
      }
    }
  }

  const exportarProgreso = () => {
    if (!carrera) return

    const data = {
      carrera: carrera.nombre,
      universidad: carrera.universidad,
      progreso: Array.from(progresoMaterias.values()),
      fechaExportacion: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `progreso-${carrera.nombre.replace(/\s+/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const compartirProgreso = async () => {
    if (!carrera) return

    const estadisticas = calcularEstadisticas()
    const texto = `Mi progreso en ${carrera.nombre} (${carrera.universidad}): ${estadisticas.aprobadas}/${estadisticas.total} materias aprobadas (${Math.round((estadisticas.aprobadas / estadisticas.total) * 100)}%)`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Progreso Académico",
          text: texto,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error al compartir:", error)
      }
    } else {
      navigator.clipboard.writeText(texto)
      alert("Progreso copiado al portapapeles")
    }
  }

  const getMateriasCorrelativasTexto = (materia: Materia, type: "cursar" | "rendir"): string => {
    const correlativasList = type === "cursar" ? materia.correlativasParaCursar : materia.correlativasParaRendir
    if (!carrera || correlativasList.length === 0) return "Ninguna"
    return correlativasList
      .map((id: number) => carrera.materias.find((m) => m.id === id)?.nombre || `Materia ${id}`)
      .join(", ")
  }

  const calcularEstadisticas = () => {
    if (!carrera) return { total: 0, aprobadas: 0, cursando: 0, regular: 0, disponibles: 0, bloqueadas: 0 }

    return {
      total: carrera.materias.length,
      aprobadas: Array.from(progresoMaterias.values()).filter((p) => p.estado === "aprobada").length,
      cursando: Array.from(progresoMaterias.values()).filter((p) => p.estado === "cursando").length,
      regular: Array.from(progresoMaterias.values()).filter((p) => p.estado === "regular").length,
      disponibles: carrera.materias.filter((m) => getDisponibilidadMateria(m) === "disponible").length,
      bloqueadas: carrera.materias.filter((m) => getDisponibilidadMateria(m) === "bloqueada").length,
    }
  }

  const estadisticas = calcularEstadisticas()
  const progreso = estadisticas.total > 0 ? Math.round((estadisticas.aprobadas / estadisticas.total) * 100) : 0

  // Agrupar materias por año y cuatrimestre
  const materiasPorAño =
    carrera?.materias.reduce(
      (acc, materia) => {
        const key = `${materia.año}-${materia.cuatrimestre}`
        if (!acc[key]) acc[key] = []
        acc[key].push(materia)
        return acc
      },
      {} as Record<string, Materia[]>,
    ) || {}

  if (!carrera) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Bienvenido a Malla Curricular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>No hay carreras disponibles. Crea tu primera carrera para comenzar.</p>
            <Button onClick={() => setMostrarEditor(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nueva Carrera
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mostrarEditor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <EditorCarrera
            carrera={carreraEditando}
            onGuardar={(carrera) => {
              if (carreraEditando) {
                actualizarCarrera(carrera)
              } else {
                agregarCarrera(carrera)
                cambiarCarreraActual(carrera.id)
              }
              setMostrarEditor(false)
              setCarreraEditando(undefined)
            }}
            onCancelar={() => {
              setMostrarEditor(false)
              setCarreraEditando(undefined)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Malla Curricular Interactiva</h1>
              <div className="flex items-center gap-4">
                <Select value={carreraActual || ""} onValueChange={cambiarCarreraActual}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Seleccionar carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {carreras.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre} - {c.universidad} ({c.añoInicio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {instalacionDisponible && (
                <Button onClick={instalarApp} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar App
                </Button>
              )}
              <Button onClick={compartirProgreso} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button onClick={exportarProgreso} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                onClick={() => {
                  setCarreraEditando(carrera)
                  setMostrarEditor(true)
                }}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Editar Carrera
              </Button>
              <Button onClick={() => setMostrarEditor(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Carrera
              </Button>
            </div>
          </div>

          {/* Panel de Estadísticas */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas del Progreso
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}>
                  {mostrarEstadisticas ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </CardHeader>
            {mostrarEstadisticas && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
                    <div className="text-sm text-gray-600">Total Materias</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{estadisticas.aprobadas}</div>
                    <div className="text-sm text-green-600">Aprobadas</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">{estadisticas.regular}</div>
                    <div className="text-sm text-orange-600">Regulares</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{estadisticas.cursando}</div>
                    <div className="text-sm text-yellow-600">Cursando</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{estadisticas.disponibles}</div>
                    <div className="text-sm text-blue-600">Disponibles</div>
                  </div>
                  {/* <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{estadisticas.bloqueadas}</div>
                  <div className="text-sm text-gray-600">Bloqueadas</div>
                </div> */}
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso General</span>
                    <span className="text-sm font-bold text-gray-900">{progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button onClick={resetearProgreso} variant="outline" size="sm" className="bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetear Progreso de Carrera
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Aprobada (Final Rendido)</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-orange-600" />
              <span>Regular (Cursada Aprobada, Final Pendiente)</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-yellow-600" />
              <span>Cursando (Inscrito)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-blue-600" />
              <span>Disponible para Cursar</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span>Bloqueada por Correlativas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-50 text-green-700 border-green-300">Final Disponible</Badge>
              <span>(para materias Regular)</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {Array.from({ length: carrera.duracionAños }, (_, i) => i + 1).map((año) => (
            <Card key={año} className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {año === 5
                    ? "Quinto"
                    : año === 4
                      ? "Cuarto"
                      : año === 3
                        ? "Tercer"
                        : año === 2
                          ? "Segundo"
                          : "Primer"}{" "}
                  Año
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((cuatrimestre) => {
                    const key = `${año}-${cuatrimestre}`
                    const materiasDelCuatrimestre = materiasPorAño[key] || []

                    if (materiasDelCuatrimestre.length === 0) return null

                    return (
                      <div key={cuatrimestre}>
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">{cuatrimestre}º Cuatrimestre</h3>
                        <div className="space-y-3">
                          {materiasDelCuatrimestre
                            .sort((a, b) => a.id - b.id)
                            .map((materia) => {
                              const disponibilidad = getDisponibilidadMateria(materia)
                              const estadoActual = getEstadoMateria(materia.id)
                              const finalDisponible = estadoActual === "regular" && puedeRendirFinalMateria(materia)

                              return (
                                <div
                                  key={materia.id}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getColorMateria(disponibilidad)} ${
                                    disponibilidad !== "bloqueada" ? "hover:shadow-md" : "cursor-not-allowed"
                                  }`}
                                  onClick={() => handleClickMateria(materia)}
                                >
                                  <div className="flex items-start gap-3">
                                    {getIcono(disponibilidad)}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-500">{materia.id}.</span>
                                        <h4 className="font-medium text-sm leading-tight">{materia.nombre}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {materia.tipo}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">
                                        <strong>Correlativas para Cursar:</strong>{" "}
                                        {getMateriasCorrelativasTexto(materia, "cursar")}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        <strong>Correlativas para Rendir:</strong>{" "}
                                        {getMateriasCorrelativasTexto(materia, "rendir")}
                                      </p>
                                      {estadoActual === "cursando" && (
                                        <Badge
                                          variant="outline"
                                          className="mt-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                                        >
                                          Cursando - Click para regularizar
                                        </Badge>
                                      )}
                                      {estadoActual === "regular" && (
                                        <Badge
                                          variant="outline"
                                          className={`mt-2 text-xs ${finalDisponible ? "bg-green-50 text-green-700 border-green-300" : "bg-orange-50 text-orange-700 border-orange-300"}`}
                                        >
                                          {finalDisponible ? "Final disponible" : "Regular - Final bloqueado"}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
