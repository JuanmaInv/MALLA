"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, Save, X } from "lucide-react"
import type { Carrera, Materia } from "@/types/carrera"

interface EditorCarreraProps {
  carrera?: Carrera
  onGuardar: (carrera: Carrera) => void
  onCancelar: () => void
}

export function EditorCarrera({ carrera, onGuardar, onCancelar }: EditorCarreraProps) {
  const [nombre, setNombre] = useState(carrera?.nombre || "")
  const [universidad, setUniversidad] = useState(carrera?.universidad || "")
  const [añoInicio, setAñoInicio] = useState(carrera?.añoInicio || new Date().getFullYear())
  const [duracionAños, setDuracionAños] = useState(carrera?.duracionAños || 5)
  const [materias, setMaterias] = useState<Materia[]>(carrera?.materias || [])
  const [editandoMateria, setEditandoMateria] = useState<Materia | null>(null)
  const [mostrarFormMateria, setMostrarFormMateria] = useState(false)

  const [formMateria, setFormMateria] = useState<Partial<Materia>>({
    nombre: "",
    año: 1,
    cuatrimestre: 1,
    correlativasParaCursar: [],
    correlativasParaRendir: [],
    tipo: "obligatoria",
  })

  const handleGuardarCarrera = () => {
    if (!nombre || !universidad || materias.length === 0) {
      alert("Por favor completa todos los campos obligatorios y agrega al menos una materia.")
      return
    }

    const nuevaCarrera: Carrera = {
      id: carrera?.id || `${nombre.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      nombre,
      universidad,
      añoInicio,
      duracionAños,
      materias,
      fechaCreacion: carrera?.fechaCreacion || new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    }

    onGuardar(nuevaCarrera)
  }

  const handleAgregarMateria = () => {
    if (!formMateria.nombre) return

    const nuevaMateria: Materia = {
      id: Math.max(0, ...materias.map((m) => m.id)) + 1, // Generar ID único
      nombre: formMateria.nombre,
      año: formMateria.año || 1,
      cuatrimestre: formMateria.cuatrimestre || 1,
      correlativasParaCursar: formMateria.correlativasParaCursar || [],
      correlativasParaRendir: formMateria.correlativasParaRendir || [],
      tipo: formMateria.tipo || "obligatoria",
    }

    setMaterias([...materias, nuevaMateria])
    setFormMateria({
      nombre: "",
      año: 1,
      cuatrimestre: 1,
      correlativasParaCursar: [],
      correlativasParaRendir: [],
      tipo: "obligatoria",
    })
    setMostrarFormMateria(false)
  }

  const handleEditarMateria = (materia: Materia) => {
    setFormMateria(materia)
    setEditandoMateria(materia)
    setMostrarFormMateria(true)
  }

  const handleActualizarMateria = () => {
    if (!editandoMateria || !formMateria.nombre) return

    const materiasActualizadas = materias.map((m) =>
      m.id === editandoMateria.id ? { ...editandoMateria, ...formMateria } : m,
    )

    setMaterias(materiasActualizadas)
    setEditandoMateria(null)
    setFormMateria({
      nombre: "",
      año: 1,
      cuatrimestre: 1,
      correlativasParaCursar: [],
      correlativasParaRendir: [],
      tipo: "obligatoria",
    })
    setMostrarFormMateria(false)
  }

  const handleEliminarMateria = (id: number) => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta materia? Esto también eliminará cualquier referencia a ella como correlativa.",
      )
    ) {
      setMaterias((prevMaterias) => {
        const filteredMaterias = prevMaterias.filter((m) => m.id !== id)
        // Limpiar correlativas que referencien a esta materia
        return filteredMaterias.map((m) => ({
          ...m,
          correlativasParaCursar: m.correlativasParaCursar.filter((c) => c !== id),
          correlativasParaRendir: m.correlativasParaRendir.filter((c) => c !== id),
        }))
      })
    }
  }

  const toggleCorrelativa = (materiaId: number, type: "cursar" | "rendir") => {
    const currentCorrelativas =
      type === "cursar" ? formMateria.correlativasParaCursar : formMateria.correlativasParaRendir
    const newCorrelativas = currentCorrelativas?.includes(materiaId)
      ? currentCorrelativas.filter((id) => id !== materiaId)
      : [...(currentCorrelativas || []), materiaId]

    if (type === "cursar") {
      setFormMateria({ ...formMateria, correlativasParaCursar: newCorrelativas })
    } else {
      setFormMateria({ ...formMateria, correlativasParaRendir: newCorrelativas })
    }
  }

  const materiasDisponiblesParaCorrelativas = materias.filter(
    (m) =>
      m.id !== editandoMateria?.id &&
      (m.año < (formMateria.año || 1) ||
        (m.año === (formMateria.año || 1) && m.cuatrimestre < (formMateria.cuatrimestre || 1))),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{carrera ? "Editar Carrera" : "Nueva Carrera"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Carrera *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ingeniería en Sistemas"
              />
            </div>
            <div>
              <Label htmlFor="universidad">Universidad *</Label>
              <Input
                id="universidad"
                value={universidad}
                onChange={(e) => setUniversidad(e.target.value)}
                placeholder="Ej: UCP"
              />
            </div>
            <div>
              <Label htmlFor="año">Año de Inicio</Label>
              <Input
                id="año"
                type="number"
                value={añoInicio}
                onChange={(e) => setAñoInicio(Number.parseInt(e.target.value))}
                min="1900"
                max="2100"
              />
            </div>
            <div>
              <Label htmlFor="duracion">Duración (años)</Label>
              <Input
                id="duracion"
                type="number"
                value={duracionAños}
                onChange={(e) => setDuracionAños(Number.parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Materias ({materias.length})</CardTitle>
            <Button onClick={() => setMostrarFormMateria(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Materia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Array.from({ length: duracionAños }, (_, año) => (
              <div key={año + 1}>
                <h3 className="text-lg font-semibold mb-3">Año {año + 1}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2].map((cuatrimestre) => (
                    <div key={cuatrimestre}>
                      <h4 className="font-medium mb-2">{cuatrimestre}º Cuatrimestre</h4>
                      <div className="space-y-2">
                        {materias
                          .filter((m) => m.año === año + 1 && m.cuatrimestre === cuatrimestre)
                          .sort((a, b) => a.id - b.id) // Ordenar por ID para consistencia
                          .map((materia) => (
                            <div key={materia.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium">
                                  {materia.id}. {materia.nombre}
                                </span>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {materia.tipo}
                                  </Badge>
                                  {materia.correlativasParaCursar.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      Cursar: {materia.correlativasParaCursar.length}
                                    </Badge>
                                  )}
                                  {materia.correlativasParaRendir.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      Rendir: {materia.correlativasParaRendir.length}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditarMateria(materia)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEliminarMateria(materia.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancelar}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleGuardarCarrera}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Carrera
        </Button>
      </div>

      <Dialog open={mostrarFormMateria} onOpenChange={setMostrarFormMateria}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoMateria ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre-materia">Nombre de la Materia *</Label>
              <Input
                id="nombre-materia"
                value={formMateria.nombre || ""}
                onChange={(e) => setFormMateria({ ...formMateria, nombre: e.target.value })}
                placeholder="Ej: Análisis Matemático I"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="año-materia">Año</Label>
                <Select
                  value={formMateria.año?.toString()}
                  onValueChange={(value) => setFormMateria({ ...formMateria, año: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: duracionAños }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Año {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cuatrimestre-materia">Cuatrimestre</Label>
                <Select
                  value={formMateria.cuatrimestre?.toString()}
                  onValueChange={(value) => setFormMateria({ ...formMateria, cuatrimestre: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Cuatrimestre</SelectItem>
                    <SelectItem value="2">2º Cuatrimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo-materia">Tipo</Label>
                <Select
                  value={formMateria.tipo}
                  onValueChange={(value: "obligatoria" | "electiva" | "practica") =>
                    setFormMateria({ ...formMateria, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obligatoria">Obligatoria</SelectItem>
                    <SelectItem value="electiva">Electiva</SelectItem>
                    <SelectItem value="practica">Práctica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Correlativas para Cursar (requieren Regular/Aprobada)</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                {materiasDisponiblesParaCorrelativas.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay materias anteriores disponibles.</p>
                ) : (
                  <div className="space-y-1">
                    {materiasDisponiblesParaCorrelativas.map((materia) => (
                      <label key={`cursar-${materia.id}`} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formMateria.correlativasParaCursar?.includes(materia.id) || false}
                          onChange={() => toggleCorrelativa(materia.id, "cursar")}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {materia.nombre} (Año {materia.año}, {materia.cuatrimestre}º Cuatr.)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Correlativas para Rendir Final (requieren APROBADA)</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                {materiasDisponiblesParaCorrelativas.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay materias anteriores disponibles.</p>
                ) : (
                  <div className="space-y-1">
                    {materiasDisponiblesParaCorrelativas.map((materia) => (
                      <label key={`rendir-${materia.id}`} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formMateria.correlativasParaRendir?.includes(materia.id) || false}
                          onChange={() => toggleCorrelativa(materia.id, "rendir")}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {materia.nombre} (Año {materia.año}, {materia.cuatrimestre}º Cuatr.)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarFormMateria(false)
                  setEditandoMateria(null)
                  setFormMateria({
                    nombre: "",
                    año: 1,
                    cuatrimestre: 1,
                    correlativasParaCursar: [],
                    correlativasParaRendir: [],
                    tipo: "obligatoria",
                  })
                }}
              >
                Cancelar
              </Button>
              <Button onClick={editandoMateria ? handleActualizarMateria : handleAgregarMateria}>
                {editandoMateria ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
