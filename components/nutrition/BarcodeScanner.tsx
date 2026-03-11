import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { X, Plus, Minus, Check, AlertCircle } from "lucide-react-native";

interface NutrientData {
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  barcode: string;
}

interface BarcodeScannerProps {
  onLog: (food: NutrientData & { servings: number }) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onLog, onClose }: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [product, setProduct] = useState<NutrientData | null>(null);
  const [servings, setServings] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProduct = async (barcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      );
      const data = await resp.json();

      if (data.status !== 1 || !data.product) {
        setError("Product not found. Try manual entry instead.");
        setLoading(false);
        return;
      }

      const p = data.product;
      const n = p.nutriments || {};
      const serving = p.serving_size || p.quantity || "1 serving";

      setProduct({
        name: p.product_name || "Unknown Product",
        brand: p.brands || undefined,
        servingSize: serving,
        calories: Math.round(
          n["energy-kcal_serving"] || n["energy-kcal_100g"] || 0,
        ),
        protein:
          Math.round((n.proteins_serving || n.proteins_100g || 0) * 10) / 10,
        carbs:
          Math.round(
            (n.carbohydrates_serving || n.carbohydrates_100g || 0) * 10,
          ) / 10,
        fat: Math.round((n.fat_serving || n.fat_100g || 0) * 10) / 10,
        fiber:
          n.fiber_serving != null
            ? Math.round(n.fiber_serving * 10) / 10
            : undefined,
        sugar:
          n.sugars_serving != null
            ? Math.round(n.sugars_serving * 10) / 10
            : undefined,
        sodium:
          n.sodium_serving != null
            ? Math.round(n.sodium_serving * 1000)
            : undefined,
        barcode,
      });
    } catch {
      setError("Failed to look up product. Check your connection.");
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!product) return;
    onLog({ ...product, servings });
  };

  const handleLookup = () => {
    if (!barcodeInput.trim()) return;
    fetchProduct(barcodeInput.trim());
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white">
          Barcode Scanner
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {!product && !loading && (
        <View>
          <Text className="mb-2 text-xs text-gray-400">
            Enter barcode number to look up nutrition info
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 rounded-lg border border-[#2A2A3A] bg-[#0F0F14] px-3 py-2.5 text-sm text-white"
              placeholder="Enter barcode..."
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              onSubmitEditing={handleLookup}
            />
            <TouchableOpacity
              className="rounded-lg bg-brand px-4 py-2.5"
              onPress={handleLookup}
            >
              <Text className="text-sm font-medium text-white">Look Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="mt-3 text-sm text-gray-400">
            Looking up product...
          </Text>
        </View>
      )}

      {error && (
        <View className="rounded-2xl border border-red-800/30 bg-red-950/20 p-4">
          <View className="flex-row items-center gap-2">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="flex-1 text-sm text-red-300">{error}</Text>
          </View>
          <TouchableOpacity
            className="mt-3 rounded-xl bg-[#2A2A3A] py-2"
            onPress={() => {
              setError(null);
              setBarcodeInput("");
            }}
          >
            <Text className="text-center text-sm font-medium text-white">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {product && !loading && (
        <View>
          <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
            <Text className="text-sm font-semibold text-white">
              {product.name}
            </Text>
            {product.brand && (
              <Text className="text-xs text-gray-400">{product.brand}</Text>
            )}
            <Text className="mt-1 text-xs text-gray-400">
              Serving: {product.servingSize}
            </Text>

            <View className="mt-3 flex-row gap-2">
              {[
                {
                  label: "cal",
                  value: Math.round(product.calories * servings),
                  color: "#f97316",
                  bg: "rgba(249,115,22,0.1)",
                },
                {
                  label: "protein",
                  value: `${Math.round(product.protein * servings)}g`,
                  color: "#3b82f6",
                  bg: "rgba(59,130,246,0.1)",
                },
                {
                  label: "carbs",
                  value: `${Math.round(product.carbs * servings)}g`,
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.1)",
                },
                {
                  label: "fat",
                  value: `${Math.round(product.fat * servings)}g`,
                  color: "#8b5cf6",
                  bg: "rgba(139,92,246,0.1)",
                },
              ].map((m) => (
                <View
                  key={m.label}
                  className="flex-1 items-center rounded-lg p-2"
                  style={{ backgroundColor: m.bg }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: m.color }}
                  >
                    {m.value}
                  </Text>
                  <Text className="text-[10px] text-gray-500">{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Servings adjuster */}
          <View className="mt-4 flex-row items-center justify-center gap-6">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3A]"
              onPress={() => setServings(Math.max(0.5, servings - 0.5))}
            >
              <Minus size={16} color="#fff" />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{servings}</Text>
              <Text className="text-[10px] text-gray-500">servings</Text>
            </View>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3A]"
              onPress={() => setServings(servings + 0.5)}
            >
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="mt-4 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-[#2A2A3A] py-3"
              onPress={() => {
                setProduct(null);
                setBarcodeInput("");
                setServings(1);
              }}
            >
              <Text className="text-center text-sm font-medium text-white">
                Scan Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-brand py-3"
              onPress={handleConfirm}
            >
              <Check size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">
                Log Food
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
