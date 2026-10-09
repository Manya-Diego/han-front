import { ModeloMatematico, Solucion } from "@/types/simplex";

const API_URL_SIMPLEX = "http://localhost:8081/api/v1/simplex";
const API_URL_IA = "http://localhost:8081/api/v1/ia";

export async function resolverSimplex(modelo: ModeloMatematico): Promise<Solucion> {
    const response = await fetch(`${API_URL_SIMPLEX}/resolver`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(modelo),
    });

    if (!response.ok) {
        throw new Error("Error al resolver el modelo matemático");
    }

    return response.json();
}

export async function extraerModeloIA(textoProblema: string): Promise<ModeloMatematico> {
    const response = await fetch(`${API_URL_IA}/extraer-modelo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ textoProblema }),
    });

    if (!response.ok) {
        throw new Error("Error al comunicarse con la IA");
    }

    return response.json();
}