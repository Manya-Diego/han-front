export interface Restriccion {
    coeficientes: number[];
    signo: string;
    valorDerecho: number;
}

export interface ModeloMatematico {
    tipoOptimizacion: string;
    variables: string[];
    funcionObjetivo: number[];
    restricciones: Restriccion[];
}

export interface SimplexIteracion {
    numeroIteracion: number;
    fase: string;
    matrizTableau: number[][];
    indiceFilaPivote: number | null;
    indiceColumnaPivote: number | null;
    variableEntrante: string;
    variableSaliente: string;
}

export interface Solucion {
    estado: string;
    valorOptimoZ: number;
    valoresVariables: number[];
    historialIteraciones: SimplexIteracion[];
}