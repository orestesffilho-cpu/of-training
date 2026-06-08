// src/config/exerciseLibrary.js

export const EXERCISE_LIBRARY = [
  // PEITO
  { keywords: ["supino inclinado", "crucifixo inclinado", "polia baixa", "clavicular"], group: "Peito", subgroup: "Porção Superior" },
  { keywords: ["supino declinado", "crucifixo declinado", "polia alta", "cross over", "paralelas"], group: "Peito", subgroup: "Porção Inferior" },
  { keywords: ["supino", "crucifixo", "peito", "peck deck", "voador", "press"], group: "Peito", subgroup: "Porção Média" },
  
  // COSTAS
  { keywords: ["puxada", "pulldown", "barra fixa", "chin up", "serrote", "unilateral"], group: "Costas", subgroup: "Largura (Dorsais)" },
  { keywords: ["remada baixa", "remada cavalo", "triangulo", "trapezio", "romboide"], group: "Costas", subgroup: "Espessura (Trapézio/Romboides)" },
  { keywords: ["terra", "levantamento terra", "lombar", "erectores"], group: "Costas", subgroup: "Lombar" },
  
  // OMBROS
  { keywords: ["crucifixo invertido", "face pull", "deltoide posterior", "posterior de ombro"], group: "Ombros", subgroup: "Posterior (Deltóide Posterior)" },
  { keywords: ["elevacao lateral", "elevação lateral", "polia lateral"], group: "Ombros", subgroup: "Lateral" },
  { keywords: ["desenvolvimento", "militar", "elevacao frontal", "elevação frontal"], group: "Ombros", subgroup: "Anterior (Frontal)" },
  
  // BRAÇOS
  { keywords: ["rosca martelo", "martelo", "braquial"], group: "Bíceps", subgroup: "Braquial" },
  { keywords: ["rosca bicep", "rosca direta", "scott", "concentrada", "alternada"], group: "Bíceps", subgroup: "Cabeça Longa" },
  { keywords: ["tricep testa", "frances", "francês", "coice"], group: "Tríceps", subgroup: "Cabeça Longa" },
  { keywords: ["tricep pulley", "tricep corda", "tricep barra"], group: "Tríceps", subgroup: "Cabeça Lateral" },
  
  // PERNAS, GLÚTEOS E PANTURRILHA
  { keywords: ["stiff", "flexora", "posterior de coxa", "isquiotibiais"], group: "Pernas", subgroup: "Posteriores (Isquiotibiais)" },
  { keywords: ["agachamento", "leg press", "extensora", "quadriceps", "quadrícieps", "afundo", "passada"], group: "Pernas", subgroup: "Quadríceps" },
  { keywords: ["elevacao pelvica", "elevação pélvica", "gluteo maximo", "glúteo máximo"], group: "Glúteos", subgroup: "Glúteo Máximo" },
  { keywords: ["abdutor", "cadeira abdutora", "gluteo medio", "glúteo médio"], group: "Glúteos", subgroup: "Glúteo Médio/Mínimo" },
  { keywords: ["panturrilha em pe", "panturrilha em pé", "gastrocnemio"], group: "Panturrilha", subgroup: "Gastrocnêmio" },
  { keywords: ["panturrilha sentado", "soleu", "sóleu"], group: "Panturrilha", subgroup: "Sóleu" },
  
  // TRONCO CENTRAL
  { keywords: ["abdominal", "infra", "supra", "crunch", "prancha"], group: "Abdômen", subgroup: "Supra" }
];

/**
 * Função utilitária para descobrir dinamicamente os grupos musculares com base no nome digitado
 * @param {string} exerciseName Nome inserido pelo usuário
 * @returns {{group: string, subgroup: string}} Objeto contendo a classificação anatômica mapeada
 */
export function getMuscleMapping(exerciseName) {
  if (!exerciseName || !exerciseName.trim()) {
    return { group: "", subgroup: "" };
  }

  // Normalização para ignorar acentos e maiúsculas/minúsculas
  const nameNormalized = exerciseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const match = EXERCISE_LIBRARY.find(item => 
    item.keywords.some(keyword => {
      const keywordClean = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nameNormalized.includes(keywordClean);
    })
  );

  if (match) {
    return { group: match.group, subgroup: match.subgroup };
  }

  return { group: "Outro", subgroup: "Geral" };
}