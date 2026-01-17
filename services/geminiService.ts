
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, MealPlanResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateMealPlan(prefs: UserPreferences, optimization: 'balanced' | 'cheapest' | 'fastest' | 'protein' = 'balanced'): Promise<MealPlanResponse> {
  const prompt = `
    Generate a ${prefs.days}-day realistic, low-cost Indian vegetarian meal plan.
    City Type: ${prefs.cityType}
    Budget: ₹${prefs.budgetPerDay} per day
    Max cooking time: ${prefs.timePerMeal} mins per meal
    Kitchen Setup: ${prefs.kitchenSetup}
    Available ingredients: ${prefs.ingredients.join(", ")}
    Optimization focus: ${optimization}

    RULES:
    1. Use at least 3 available ingredients per day.
    2. Ensure meals are common in Indian households (Dal, Chawal, Sabzi, Poha, etc.).
    3. Respect student life: some meals must be portable or low-effort.
    4. If budget is infeasible, provide exactly two fallback descriptions.
    5. Output must be strictly valid JSON according to the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          personalisationProof: { type: Type.STRING },
          usingYourIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          dailyPlans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                breakfast: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cookingTime: { type: Type.NUMBER },
                    ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isPortable: { type: Type.BOOLEAN },
                    effortLevel: { type: Type.STRING }
                  }
                },
                lunch: {
                   type: Type.OBJECT,
                   properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cookingTime: { type: Type.NUMBER },
                    ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isPortable: { type: Type.BOOLEAN },
                    effortLevel: { type: Type.STRING }
                  }
                },
                dinner: {
                   type: Type.OBJECT,
                   properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cookingTime: { type: Type.NUMBER },
                    ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isPortable: { type: Type.BOOLEAN },
                    effortLevel: { type: Type.STRING }
                  }
                },
                cookingSequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                substitutions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      meal: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          },
          groceryList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                quantity: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                category: { type: Type.STRING }
              }
            }
          },
          budgetFeasibility: {
            type: Type.OBJECT,
            properties: {
              isFeasible: { type: Type.BOOLEAN },
              totalEstimatedCost: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            }
          },
          fallbackPlans: {
            type: Type.OBJECT,
            properties: {
              cheapest: { type: Type.STRING },
              reducedVariety: { type: Type.STRING },
              failureReason: { type: Type.STRING }
            }
          }
        },
        required: ["success", "personalisationProof", "dailyPlans", "groceryList", "budgetFeasibility", "usingYourIngredients"]
      }
    }
  });

  return JSON.parse(response.text);
}
