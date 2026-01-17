
export enum CityType {
  TIER1 = 'Tier-1',
  TIER2 = 'Tier-2',
  TIER3 = 'Tier-3'
}

export enum KitchenSetup {
  MINIMAL = 'Minimal (Single Induction/Kettle)',
  MEDIUM = 'Medium (Gas Stove, Basic Cookware)',
  FULL = 'Full (Oven, Microwave, Mixer, Stove)'
}

export interface UserPreferences {
  cityType: CityType;
  dietType: string;
  budgetPerDay: number;
  timePerMeal: number;
  kitchenSetup: KitchenSetup;
  ingredients: string[];
  days: number;
}

export interface Meal {
  name: string;
  description: string;
  cookingTime: number;
  ingredientsUsed: string[];
  isPortable: boolean;
  effortLevel: 'Low' | 'Medium' | 'High';
}

export interface DailyPlan {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  cookingSequence: string[];
  substitutions: { meal: string; options: string[] }[];
}

export interface GroceryItem {
  item: string;
  quantity: string;
  estimatedCost: number;
  category: string;
}

export interface MealPlanResponse {
  success: boolean;
  personalisationProof: string;
  usingYourIngredients: string[];
  dailyPlans: DailyPlan[];
  groceryList: GroceryItem[];
  budgetFeasibility: {
    isFeasible: boolean;
    totalEstimatedCost: number;
    explanation: string;
  };
  fallbackPlans?: {
    cheapest: string;
    reducedVariety: string;
    failureReason: string;
  };
}
