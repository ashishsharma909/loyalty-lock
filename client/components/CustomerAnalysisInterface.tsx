import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Users,
  Baby,
  Calendar,
  DollarSign,
  CreditCard,
  Wifi,
  Brain,
  Sparkles,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";

interface FormData {
  gender: string;
  seniorCitizen: boolean;
  hasPartner: boolean;
  hasDependents: boolean;
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contractType: string;
  internetService: string;
  paymentMethod: string;
}

interface AnalysisResult {
  riskLevel: "low" | "high";
  confidence: number;
  immediateActions: string[];
  longTermActions: string[];
  mlPrediction?: string;
  error?: string;
}

const CustomerAnalysisInterface = () => {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    seniorCitizen: false,
    hasPartner: false,
    hasDependents: false,
    tenure: 12,
    monthlyCharges: 0,
    totalCharges: 0,
    contractType: "",
    internetService: "",
    paymentMethod: "",
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [prediction, setPrediction] = useState<string>("");
  const neuralRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const simulateAnalysis = (): AnalysisResult => {
    // Simple scoring algorithm for demonstration
    let score = 0;

    // Tenure scoring
    if (formData.tenure < 6) score += 30;
    else if (formData.tenure < 24) score += 15;

    // Contract type scoring
    if (formData.contractType === "Month-to-month") score += 25;
    else if (formData.contractType === "One year") score += 10;

    // Monthly charges scoring
    if (formData.monthlyCharges > 80) score += 20;
    else if (formData.monthlyCharges > 50) score += 10;

    // Payment method scoring
    if (formData.paymentMethod === "Electronic check") score += 15;

    // Internet service scoring
    if (formData.internetService === "Fiber optic") score -= 5;

    // Demographics
    if (formData.seniorCitizen) score += 10;
    if (!formData.hasPartner) score += 5;

    const confidence = Math.min(Math.max(score + Math.random() * 20, 10), 95);
    const riskLevel = score > 35 ? "high" : "low";

    return {
      riskLevel,
      confidence: Math.round(confidence),
      immediateActions:
        riskLevel === "high"
          ? [
              "🎯 Offer loyalty discount",
              "📞 Schedule retention call",
              "💝 Provide premium support access",
            ]
          : [
              "⭐ Send satisfaction survey",
              "🎁 Offer upgrade incentives",
              "📧 Share usage analytics",
            ],
      longTermActions:
        riskLevel === "high"
          ? [
              "📋 Enroll in loyalty program",
              "🔄 Suggest contract upgrade",
              "🎓 Provide training sessions",
            ]
          : [
              "🌟 Create advocacy opportunities",
              "🔗 Introduce referral program",
              "📈 Monitor usage patterns",
            ],
    };
  };

  const handleMLPrediction = async () => {
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: formData.gender,
          SeniorCitizen: formData.seniorCitizen ? 1 : 0,
          Partner: formData.hasPartner ? "Yes" : "No",
          Dependents: formData.hasDependents ? "Yes" : "No",
          tenure: formData.tenure,
          MonthlyCharges: formData.monthlyCharges,
          TotalCharges: formData.totalCharges,
          Contract: formData.contractType,
          InternetService: formData.internetService,
          PaymentMethod: formData.paymentMethod,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("🔮 Prediction:", data.churn);
      const predictionText = data.churn === 1 ? "🚨 Likely to CHURN!" : "✅ Likely to STAY";
      setPrediction(predictionText);
      return predictionText;
    } catch (error) {
      console.error("ML Prediction Error:", error);
      return "⚠️ ML Service Unavailable";
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setShowResult(false);
    setPrediction("");

    // Simulate AI processing delay
    setTimeout(async () => {
      // Get ML prediction
      const mlPrediction = await handleMLPrediction();
      
      // Get simulated analysis
      const analysisResult = simulateAnalysis();
      
      // Combine results
      const finalResult: AnalysisResult = {
        ...analysisResult,
        mlPrediction: mlPrediction,
      };

      // Update risk level based on ML prediction if available
      if (mlPrediction.includes("CHURN")) {
        finalResult.riskLevel = "high";
        finalResult.confidence = Math.max(finalResult.confidence, 85);
      } else if (mlPrediction.includes("STAY")) {
        finalResult.riskLevel = "low";
        finalResult.confidence = Math.max(finalResult.confidence, 80);
      }

      setResult(finalResult);
      setIsAnalyzing(false);
      setTimeout(() => setShowResult(true), 500);
    }, 3000);
  };

  // Neural network animation
  useEffect(() => {
    if (!isAnalyzing || !neuralRef.current) return;

    const interval = setInterval(() => {
      const nodes = neuralRef.current?.querySelectorAll(".neural-node");
      nodes?.forEach((node, index) => {
        setTimeout(() => {
          node.classList.add("pulse");
          setTimeout(() => node.classList.remove("pulse"), 300);
        }, index * 100);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 rounded-2xl border border-cyan-400/20 p-8 relative overflow-hidden">
      {/* Neural network background animation */}
      <div
        ref={neuralRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
      >
        <svg className="w-full h-full">
          {/* Neural network connections */}
          {[...Array(12)].map((_, i) => (
            <g key={i}>
              <line
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="#00bcd4"
                strokeWidth="1"
                opacity="0.3"
                className="neural-connection"
              />
              <circle
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="2"
                fill="#00bcd4"
                className="neural-node"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">
            Customer Analysis Interface
          </h2>
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <p className="text-gray-400">
          Advanced AI-powered customer loyalty prediction system with ML integration
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Input Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Profile
          </h3>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              👤 Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Toggles Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                👴 Senior Citizen
              </label>
              <button
                onClick={() =>
                  handleInputChange("seniorCitizen", !formData.seniorCitizen)
                }
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.seniorCitizen
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-gray-800/50 border-gray-600 text-gray-400"
                } border`}
              >
                {formData.seniorCitizen ? "Yes" : "No"}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Has Partner
              </label>
              <button
                onClick={() =>
                  handleInputChange("hasPartner", !formData.hasPartner)
                }
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.hasPartner
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-gray-800/50 border-gray-600 text-gray-400"
                } border`}
              >
                {formData.hasPartner ? "Yes" : "No"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Baby className="w-4 h-4" />
              Has Dependents
            </label>
            <button
              onClick={() =>
                handleInputChange("hasDependents", !formData.hasDependents)
              }
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                formData.hasDependents
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-gray-800/50 border-gray-600 text-gray-400"
              } border`}
            >
              {formData.hasDependents ? "Yes" : "No"}
            </button>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tenure: {formData.tenure} months
            </label>
            <input
              type="range"
              min="1"
              max="72"
              value={formData.tenure}
              onChange={(e) =>
                handleInputChange("tenure", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>

          {/* Charges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Charges
              </label>
              <input
                type="number"
                value={formData.monthlyCharges}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyCharges",
                    parseFloat(e.target.value),
                  )
                }
                className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                💰 Total Charges
              </label>
              <input
                type="number"
                value={formData.totalCharges}
                onChange={(e) =>
                  handleInputChange("totalCharges", parseFloat(e.target.value))
                }
                className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Contract Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              📋 Contract Type
            </label>
            <select
              value={formData.contractType}
              onChange={(e) =>
                handleInputChange("contractType", e.target.value)
              }
              className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            >
              <option value="">Select Contract</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Internet Service */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Internet Service
            </label>
            <select
              value={formData.internetService}
              onChange={(e) =>
                handleInputChange("internetService", e.target.value)
              }
              className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            >
              <option value="">Select Service</option>
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                handleInputChange("paymentMethod", e.target.value)
              }
              className="w-full bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            >
              <option value="">Select Payment Method</option>
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer">Bank transfer</option>
              <option value="Credit card">Credit card</option>
            </select>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-5 h-5" />
                </motion.div>
                Analyzing Neural Pattern...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with ML Prediction
              </>
            )}

            {/* Glowing animation */}
            {isAnalyzing && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            📊 Analysis Results
          </h3>

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800/30 border border-cyan-400/20 rounded-lg p-6 text-center"
              >
                <div className="space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-cyan-300 font-medium">
                    Processing customer data through neural networks and ML models...
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* ML Prediction Result */}
                {result.mlPrediction && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      🤖 ML Model Prediction
                    </h5>
                    <p className="text-lg font-bold text-white">{result.mlPrediction}</p>
                  </div>
                )}

                {/* Prediction Result */}
                <div
                  className={`p-6 rounded-lg border-2 ${
                    result.riskLevel === "low"
                      ? "bg-green-500/10 border-green-400/50"
                      : "bg-red-500/10 border-red-400/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {result.riskLevel === "low" ? (
                        <Shield className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {result.riskLevel === "low"
                            ? "Low Risk"
                            : "High Risk"}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Churn Prediction Result
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          result.riskLevel === "low"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {result.confidence}%
                      </div>
                      <p className="text-xs text-gray-400">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Immediate Actions */}
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Immediate Actions
                    </h5>
                    <ul className="space-y-2">
                      {result.immediateActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-300">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Long Term Actions */}
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Long Term Strategy
                    </h5>
                    <ul className="space-y-2">
                      {result.longTermActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-300">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAnalyzing && !result && (
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-8 text-center">
              <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Fill out the customer profile and click "Analyze with ML Prediction"
                to get AI-powered churn prediction results with real ML model integration.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .neural-node.pulse {
          animation: neural-pulse 0.3s ease-in-out;
        }

        @keyframes neural-pulse {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }

        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          background: #0891b2;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default CustomerAnalysisInterface;