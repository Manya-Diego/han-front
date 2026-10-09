"use client";
import { useState } from "react";
import { ModeloMatematico, Restriccion, Solucion } from "@/types/simplex";
import { resolverSimplex, extraerModeloIA } from "@/services/api";
import { Play, Plus, Trash2, Calculator, ArrowRight, Wand2 } from "lucide-react";

export default function Home() {
    const [textoProblema, setTextoProblema] = useState("");
    const [loadingIA, setLoadingIA] = useState(false);
    const [tipoOptimizacion, setTipoOptimizacion] = useState("MAXIMIZAR");
    const [numVariables, setNumVariables] = useState(2);
    const [funcionObjetivo, setFuncionObjetivo] = useState<number[]>([4, 1]);
    const [restricciones, setRestricciones] = useState<Restriccion[]>([
        { coeficientes: [3, 1], signo: "=", valorDerecho: 3 },
        { coeficientes: [4, 3], signo: ">=", valorDerecho: 6 },
        { coeficientes: [1, 2], signo: "<=", valorDerecho: 4 },
    ]);
    const [solucion, setSolucion] = useState<Solucion | null>(null);
    const [loading, setLoading] = useState(false);

    const handleNumVarsChange = (val: number) => {
        if (val < 1 || val > 10) return;
        setNumVariables(val);
        setFuncionObjetivo(Array(val).fill(0));
        setRestricciones(
            restricciones.map((r) => ({
                ...r,
                coeficientes: Array(val).fill(0),
            }))
        );
    };

    const handleAgregarRestriccion = () => {
        setRestricciones([
            ...restricciones,
            { coeficientes: Array(numVariables).fill(0), signo: "<=", valorDerecho: 0 },
        ]);
    };

    const handleEliminarRestriccion = (index: number) => {
        setRestricciones(restricciones.filter((_, i) => i !== index));
    };

    const handleExtraerConIA = async () => {
        if (!textoProblema.trim()) return;
        setLoadingIA(true);
        try {
            const modeloExtraido = await extraerModeloIA(textoProblema);
            setTipoOptimizacion(modeloExtraido.tipoOptimizacion);
            setNumVariables(modeloExtraido.variables.length);
            setFuncionObjetivo(modeloExtraido.funcionObjetivo);
            setRestricciones(modeloExtraido.restricciones);
        } catch (error) {
            alert("Error al extraer el modelo con IA.");
        } finally {
            setLoadingIA(false);
        }
    };

    const handleResolver = async () => {
        setLoading(true);
        try {
            const modelo: ModeloMatematico = {
                tipoOptimizacion,
                variables: Array.from({ length: numVariables }, (_, i) => `x${i + 1}`),
                funcionObjetivo,
                restricciones,
            };
            const resultado = await resolverSimplex(modelo);
            setSolucion(resultado);
        } catch (error) {
            alert("Error conectando con el backend. Verifica que Spring Boot esté encendido.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
            <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">HAN</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Motor Simplex Dos Fases</p>
                        </div>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
                <section className="xl:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
                            1. Redacción del Caso
                        </h2>
                        <textarea
                            value={textoProblema}
                            onChange={(e) => setTextoProblema(e.target.value)}
                            placeholder="Describe el problema de optimización aquí..."
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition mb-4"
                        />
                        <button
                            onClick={handleExtraerConIA}
                            disabled={loadingIA || !textoProblema.trim()}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingIA ? (
                                <span key="ia-loading" className="animate-pulse">Analizando texto con IA...</span>
                            ) : (
                                <span key="ia-ready" className="flex items-center justify-center gap-2">
                                    <Wand2 size={18} /> Extraer Modelo con IA
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-3">
                            2. Estructura del Modelo
                        </h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Objetivo</label>
                                <select
                                    value={tipoOptimizacion}
                                    onChange={(e) => setTipoOptimizacion(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                                >
                                    <option value="MAXIMIZAR">Maximizar (Max Z)</option>
                                    <option value="MINIMIZAR">Minimizar (Min Z)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Variables</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={numVariables}
                                    onChange={(e) => handleNumVarsChange(parseInt(e.target.value) || 1)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Función Objetivo</label>
                            <div className="flex items-center flex-wrap gap-2 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <span className="font-bold text-blue-800 text-lg mr-2">Z = </span>
                                {funcionObjetivo.map((val, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => {
                                                const nuevo = [...funcionObjetivo];
                                                nuevo[idx] = parseFloat(e.target.value) || 0;
                                                setFuncionObjetivo(nuevo);
                                            }}
                                            className="w-16 p-2 text-center border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <span className="font-semibold text-slate-700">x<sub className="text-xs">{idx + 1}</sub></span>
                                        {idx < funcionObjetivo.length - 1 && <span className="mx-1 text-slate-400 font-bold">+</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs font-semibold text-slate-500 uppercase">Sujeto a (Restricciones)</label>
                            </div>
                            <div className="space-y-3 mb-4">
                                {restricciones.map((res, i) => (
                                    <div key={i} className="flex gap-2 items-center p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-slate-300 transition">
                                        <div className="flex-1 flex flex-wrap items-center gap-2">
                                            {res.coeficientes.map((coef, j) => (
                                                <div key={j} className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={coef}
                                                        onChange={(e) => {
                                                            const nuevas = [...restricciones];
                                                            nuevas[i].coeficientes[j] = parseFloat(e.target.value) || 0;
                                                            setRestricciones(nuevas);
                                                        }}
                                                        className="w-14 p-1.5 text-center text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                    <span className="font-medium text-slate-600 text-sm">x<sub className="text-[10px]">{j + 1}</sub></span>
                                                    {j < res.coeficientes.length - 1 && <span className="text-slate-400 mx-0.5">+</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <select
                                            value={res.signo}
                                            onChange={(e) => {
                                                const nuevas = [...restricciones];
                                                nuevas[i].signo = e.target.value;
                                                setRestricciones(nuevas);
                                            }}
                                            className="p-1.5 text-sm font-bold border border-slate-300 rounded bg-white text-slate-700 w-14 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="<=">&le;</option>
                                            <option value=">=">&ge;</option>
                                            <option value="=">=</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={res.valorDerecho}
                                            onChange={(e) => {
                                                const nuevas = [...restricciones];
                                                nuevas[i].valorDerecho = parseFloat(e.target.value) || 0;
                                                setRestricciones(nuevas);
                                            }}
                                            className="w-16 p-1.5 text-center text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                                        />
                                        <button
                                            onClick={() => handleEliminarRestriccion(i)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAgregarRestriccion}
                                className="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-500 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Añadir Restricción
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleResolver}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span key="btn-loading" className="animate-pulse">Calculando óptimo...</span>
                        ) : (
                            <span key="btn-ready" className="flex items-center justify-center gap-2">
                                <Play size={20} fill="currentColor" /> Ejecutar Simplex
                            </span>
                        )}
                    </button>
                </section>
                <section className="xl:col-span-7">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                        <h2 className="text-lg font-bold mb-6 border-b pb-3 flex items-center gap-2">
                            3. Reporte de Resultados
                        </h2>
                        {!solucion ? (
                            <div key="panel-vacio" className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <ArrowRight size={32} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-medium">Configura el modelo y presiona ejecutar</p>
                            </div>
                        ) : (
                            <div key="panel-resultados" className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Estado de Solución</p>
                                        <p className="text-2xl font-black text-emerald-800">{solucion.estado}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Valor Óptimo (Z)</p>
                                        <p className="text-2xl font-black text-blue-800">{solucion.valorOptimoZ.toFixed(4)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Valores Finales</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {solucion.valoresVariables.map((val, idx) => (
                                            <div key={`var-${idx}`} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                <span className="bg-slate-100 px-3 py-2 font-semibold text-slate-600 text-sm border-r border-slate-200">
                                                    x<sub className="text-[10px]">{idx + 1}</sub>
                                                </span>
                                                <span className="px-4 py-2 font-bold text-slate-800">
                                                    {val.toFixed(4)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b pb-2">
                                        Tabla Simplex (Paso a Paso)
                                    </h3>
                                    <div className="space-y-6">
                                        {solucion.historialIteraciones.map((it, idx) => (
                                            <div key={`iter-${idx}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                                                            Iteración {it.numeroIteracion}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${it.fase === "FASE_1" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"}`}>
                                                            {it.fase.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    {it.variableEntrante && it.variableSaliente ? (
                                                        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 border border-slate-200 rounded-md">
                                                            Entra: <span className="text-emerald-600">{it.variableEntrante}</span> &rarr; Sale: <span className="text-red-600">{it.variableSaliente}</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-center">
                                                        <tbody className="divide-y divide-slate-100">
                                                        {it.matrizTableau.map((fila, fIdx) => (
                                                            <tr key={`fila-${idx}-${fIdx}`} className={`hover:bg-slate-50 transition ${fIdx === 0 || fIdx === 1 ? "bg-slate-100/50 font-bold text-slate-800 border-b-2 border-slate-200" : "text-slate-600"}`}>
                                                                {fila.map((celda, cIdx) => (
                                                                    <td key={`celda-${idx}-${fIdx}-${cIdx}`} className={`px-4 py-2.5 border-x border-slate-100 ${
                                                                        fIdx === it.indiceFilaPivote && cIdx === it.indiceColumnaPivote
                                                                            ? "bg-blue-100 font-bold text-blue-700 outline outline-2 outline-blue-400"
                                                                            : ""
                                                                    }`}>
                                                                        {Math.abs(celda) < 0.0001 ? "0" : celda.toFixed(2)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}