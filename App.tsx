
import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Clock, 
  Wallet, 
  ShoppingBag, 
  ChefHat, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { CityType, KitchenSetup, UserPreferences, MealPlanResponse } from './types';
import { generateMealPlan } from './services/geminiService';

const LOADING_MESSAGES = [
  "Consulting Tier-2 city price indices...",
  "Optimizing for your ₹150 budget...",
  "Filtering student-friendly recipes...",
  "Checking pantry ingredient compatibility...",
  "Calculating total grocery costs...",
  "Balancing prep time with student schedules...",
  "Finalizing your personalized plan..."
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<MealPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<'balanced' | 'cheapest' | 'fastest' | 'protein'>('balanced');

  const [prefs, setPrefs] = useState<UserPreferences>({
    cityType: CityType.TIER2,
    dietType: 'Vegetarian',
    budgetPerDay: 150,
    timePerMeal: 25,
    kitchenSetup: KitchenSetup.MEDIUM,
    ingredients: ['rice', 'dal', 'onions', 'tomatoes', 'potatoes', 'turmeric', 'chilli powder'],
    days: 2
  });

  const [newIngredient, setNewIngredient] = useState('');

  // Cycle loading messages to improve perceived speed
  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (opt = optimization) => {
    setLoading(true);
    setLoadingMessageIndex(0);
    setError(null);
    try {
      const plan = await generateMealPlan(prefs, opt);
      setResult(plan);
      setOptimization(opt);
    } catch (err) {
      console.error(err);
      setError("Failed to generate meal plan. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !prefs.ingredients.includes(newIngredient.trim().toLowerCase())) {
      setPrefs({ ...prefs, ingredients: [...prefs.ingredients, newIngredient.trim().toLowerCase()] });
      setNewIngredient('');
    }
  };

  const removeIngredient = (ing: string) => {
    setPrefs({ ...prefs, ingredients: prefs.ingredients.filter(i => i !== ing) });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="soft-pink py-8 px-4 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Utensils className="accent-rose" /> PinkPlate
        </h1>
        <p className="text-gray-600 mt-2 font-medium">Smart Indian Meal Planning for Students</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Inputs */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-soft-pink">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
              <ChefHat size={20} className="accent-rose" /> Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">City Tier</label>
                <select 
                  className="w-full bg-pink-50 border border-soft-pink rounded-xl p-2 text-gray-700"
                  value={prefs.cityType}
                  onChange={(e) => setPrefs({...prefs, cityType: e.target.value as CityType})}
                  disabled={loading}
                >
                  {Object.values(CityType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Daily Budget (₹)</label>
                <input 
                  type="number"
                  className="w-full bg-pink-50 border border-soft-pink rounded-xl p-2"
                  value={prefs.budgetPerDay}
                  onChange={(e) => setPrefs({...prefs, budgetPerDay: parseInt(e.target.value)})}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Max Prep Time (mins)</label>
                <input 
                  type="number"
                  className="w-full bg-pink-50 border border-soft-pink rounded-xl p-2"
                  value={prefs.timePerMeal}
                  onChange={(e) => setPrefs({...prefs, timePerMeal: parseInt(e.target.value)})}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Kitchen Setup</label>
                <select 
                  className="w-full bg-pink-50 border border-soft-pink rounded-xl p-2"
                  value={prefs.kitchenSetup}
                  onChange={(e) => setPrefs({...prefs, kitchenSetup: e.target.value as KitchenSetup})}
                  disabled={loading}
                >
                  {Object.values(KitchenSetup).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Pantry Lock (Ingredients)</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    className="flex-1 bg-pink-50 border border-soft-pink rounded-xl p-2 text-sm"
                    placeholder="e.g. Rice, Onion"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                    disabled={loading}
                  />
                  <button 
                    onClick={addIngredient}
                    disabled={loading}
                    className="bg-accent-rose text-white rounded-xl px-4 py-2 hover:opacity-90 transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prefs.ingredients.map(ing => (
                    <span key={ing} className="bg-white border border-soft-pink text-xs font-medium text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                      {ing} <X size={12} className={loading ? "opacity-30" : "cursor-pointer"} onClick={() => !loading && removeIngredient(ing)} />
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleGenerate()}
                disabled={loading}
                className="w-full bg-accent-rose text-white font-bold py-3 rounded-2xl shadow-lg hover:shadow-xl transform transition active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Planning...
                  </>
                ) : (
                  <>
                    Generate Meal Plan <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content: Results */}
        <section className="lg:col-span-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-2 mb-6">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-soft-pink">
              <div className="bg-pink-100 p-6 rounded-full mb-4">
                <ChefHat size={48} className="accent-rose" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Ready to plan?</h3>
              <p className="text-gray-500 max-w-sm">Adjust your budget and pantry items, then hit generate for a custom student-friendly plan.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-8">
              {/* Cycling Loading Message */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-soft-pink text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                  <Loader2 size={32} className="accent-rose animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 animate-pulse">
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </h3>
                <p className="text-sm text-gray-400 mt-2">Our AI is crunching the numbers for your perfect plan...</p>
              </div>

              {/* Detailed Skeleton */}
              <div className="space-y-6 animate-pulse">
                <div className="bg-white rounded-3xl overflow-hidden border border-soft-pink h-64">
                  <div className="h-12 bg-gray-100 mb-6"></div>
                  <div className="px-6 grid grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-50 rounded-xl"></div>
                    <div className="h-32 bg-gray-50 rounded-xl"></div>
                    <div className="h-32 bg-gray-50 rounded-xl"></div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl h-48 border border-soft-pink p-8">
                  <div className="w-1/3 h-6 bg-gray-100 mb-4 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-50 rounded w-full"></div>
                    <div className="h-4 bg-gray-50 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-50 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8">
              {/* Proof of Personalization */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-accent-rose">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-green-500" /> Personalisation Proof
                </h4>
                <p className="text-gray-600 italic">"Based on your inputs... {result.personalisationProof || 'Generic student optimization applied.'}"</p>
                <div className="mt-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Using your ingredients:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.usingYourIngredients?.map(ing => (
                      <span key={ing} className="text-xs bg-pink-50 text-accent-rose font-semibold px-2 py-0.5 rounded-md">{ing}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optimization Toggles */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                {['balanced', 'cheapest', 'fastest', 'protein'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleGenerate(opt as any)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-1 ${
                      optimization === opt 
                        ? 'bg-accent-rose text-white' 
                        : 'bg-white text-gray-500 border border-soft-pink hover:bg-pink-50'
                    }`}
                  >
                    <RotateCcw size={14} /> {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>

              {/* Meal Plan List */}
              <div className="space-y-6">
                {result.dailyPlans?.map((day) => (
                  <div key={day.day} className="bg-white rounded-3xl shadow-sm border border-soft-pink overflow-hidden">
                    <div className="soft-pink px-6 py-4 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Day {day.day} Meal Plan</h3>
                      <div className="flex gap-2">
                        <span className="text-xs bg-white/50 px-2 py-1 rounded-full font-bold">Low Cost</span>
                      </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { type: 'Breakfast', meal: day.breakfast },
                        { type: 'Lunch', meal: day.lunch },
                        { type: 'Dinner', meal: day.dinner }
                      ].map((m, idx) => (
                        <div key={idx} className="space-y-2">
                          <span className="text-xs font-bold text-accent-rose uppercase tracking-widest">{m.type}</span>
                          <h4 className="font-bold text-gray-800 text-lg leading-tight">{m.meal?.name || 'Loading...'}</h4>
                          <p className="text-xs text-gray-500 line-clamp-3">{m.meal?.description || 'No description available.'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={12} /> {m.meal?.cookingTime || '--'}m</span>
                            {m.meal?.isPortable && <span className="text-green-600 bg-green-50 px-1.5 rounded text-[10px] uppercase font-bold tracking-tighter">Portable</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-soft-pink p-6 bg-pink-50/30">
                      <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock size={16} className="accent-rose" /> Cooking Sequence
                      </h5>
                      <ol className="space-y-2">
                        {day.cookingSequence?.map((step, sIdx) => (
                          <li key={sIdx} className="text-sm text-gray-600 flex gap-3">
                            <span className="font-bold text-accent-rose">{sIdx + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grocery List */}
              <div className="bg-white rounded-3xl p-8 border border-soft-pink shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="accent-rose" /> Grocery List
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Estimated Total</p>
                    <p className="text-2xl font-bold text-accent-rose">₹{result.budgetFeasibility?.totalEstimatedCost || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Grouped by Category */}
                  {Array.from(new Set(result.groceryList?.map(g => g.category) || [])).map(cat => (
                    <div key={cat}>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-pink-100 pb-1">{cat}</h4>
                      <ul className="space-y-2">
                        {result.groceryList?.filter(g => g.category === cat).map((item, iIdx) => (
                          <li key={iIdx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-soft-pink"></div> {item.item}
                            </span>
                            <div className="text-right">
                              <span className="font-medium text-gray-500 mr-4">{item.quantity}</span>
                              <span className="font-bold text-gray-400">₹{item.estimatedCost}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Feasibility */}
              <div className={`p-6 rounded-3xl border flex items-start gap-4 ${result.budgetFeasibility?.isFeasible ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className={`p-2 rounded-xl ${result.budgetFeasibility?.isFeasible ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <Wallet className={result.budgetFeasibility?.isFeasible ? 'text-green-600' : 'text-orange-600'} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Budget Feasibility Check</h4>
                  <p className="text-sm text-gray-600 mt-1">{result.budgetFeasibility?.explanation || 'Checking budget...'}</p>
                </div>
              </div>

              {/* Fallback Section if applicable */}
              {result.budgetFeasibility?.isFeasible === false && result.fallbackPlans && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-dashed border-accent-rose">
                    <h4 className="font-bold text-red-600 flex items-center gap-2 mb-2">
                      <AlertCircle size={18} /> Budget Fallback Required
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-pink-50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-gray-400 uppercase">Plan A: Cheapest Possible</span>
                        <p className="text-sm text-gray-700 mt-1">{result.fallbackPlans.cheapest}</p>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-gray-400 uppercase">Plan B: Reduced Variety</span>
                        <p className="text-sm text-gray-700 mt-1">{result.fallbackPlans.reducedVariety}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>&copy; 2024 PinkPlate AI Planner. Designed with care for Indian students.</p>
      </footer>
    </div>
  );
};

export default App;
