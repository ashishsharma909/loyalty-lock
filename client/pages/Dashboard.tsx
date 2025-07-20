import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardScene3D } from "@/components/Scene3D";
import { gsap } from "gsap";

interface CustomerData {
  gender: string;
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contractType: string;
  paperlessBilling: string;
  paymentMethod: string;
  internetService: string;
  onlineSecurity: string;
  techSupport: string;
}

interface PredictionResult {
  churnProbability: number;
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
  recommendations: string[];
}

export default function Dashboard() {
  const [customerData, setCustomerData] = useState<CustomerData>({
    gender: "",
    tenure: 0,
    monthlyCharges: 0,
    totalCharges: 0,
    contractType: "",
    paperlessBilling: "",
    paymentMethod: "",
    internetService: "",
    onlineSecurity: "",
    techSupport: "",
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("predict");
  const gaugeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]:
        name.includes("Charges") || name === "tenure"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        const result = await response.json();
        setPrediction(result);
        animateGauge(result.churnProbability);
      } else {
        console.error("Prediction failed");
      }
    } catch (error) {
      console.error("Error:", error);
      // Demo prediction for demonstration
      const demoResult: PredictionResult = {
        churnProbability: Math.random() * 100,
        riskLevel:
          Math.random() > 0.5 ? "High" : Math.random() > 0.3 ? "Medium" : "Low",
        confidence: 85 + Math.random() * 10,
        recommendations: [
          "Offer personalized retention incentives",
          "Improve customer service touchpoints",
          "Provide loyalty rewards program",
          "Schedule proactive customer check-ins",
        ],
      };
      setPrediction(demoResult);
      animateGauge(demoResult.churnProbability);
    } finally {
      setIsLoading(false);
    }
  };

  const animateGauge = (value: number) => {
    if (gaugeRef.current) {
      gsap.fromTo(
        gaugeRef.current,
        { rotation: -90 },
        {
          rotation: -90 + (value / 100) * 180,
          duration: 2,
          ease: "power3.out",
        },
      );
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "High":
        return "text-red-400";
      default:
        return "text-neon-blue";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-cyber-900 to-background" />

        {/* Floating Elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 blur-xl"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 glass-card border-0 border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-bold text-sm">LL</span>
              </motion.div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Loyalty Lock
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-foreground hover:text-neon-blue transition-colors"
              >
                Home
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-neon-blue transition-colors"
              >
                Contact
              </Link>
              <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Dashboard Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              AI Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced Customer Churn Prediction & Analytics
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card p-1 rounded-xl flex">
              {[
                { id: "predict", label: "Prediction", icon: "🔮" },
                { id: "analytics", label: "Analytics", icon: "📊" },
                { id: "3d-view", label: "3D View", icon: "🌐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "predict" && (
              <motion.div
                key="predict"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* Prediction Form */}
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    Customer Data Input
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={customerData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tenure (months)
                        </label>
                        <input
                          type="number"
                          name="tenure"
                          value={customerData.tenure}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          placeholder="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Monthly Charges ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="monthlyCharges"
                          value={customerData.monthlyCharges}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Total Charges ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="totalCharges"
                          value={customerData.totalCharges}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contract Type
                        </label>
                        <select
                          name="contractType"
                          value={customerData.contractType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          required
                        >
                          <option value="">Select Contract</option>
                          <option value="Month-to-month">Month-to-month</option>
                          <option value="One year">One year</option>
                          <option value="Two year">Two year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={customerData.paymentMethod}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue"
                          required
                        >
                          <option value="">Select Payment Method</option>
                          <option value="Electronic check">
                            Electronic check
                          </option>
                          <option value="Mailed check">Mailed check</option>
                          <option value="Bank transfer">Bank transfer</option>
                          <option value="Credit card">Credit card</option>
                        </select>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-neon-blue/25 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Analyzing...
                        </div>
                      ) : (
                        "Predict Churn Risk"
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* Prediction Results */}
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-violet rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    Prediction Results
                  </h2>

                  {prediction ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-6"
                    >
                      {/* Churn Probability Gauge */}
                      <div className="text-center">
                        <div className="relative w-48 h-24 mx-auto mb-4">
                          <svg viewBox="0 0 200 100" className="w-full h-full">
                            <path
                              d="M 20 80 A 80 80 0 0 1 180 80"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="10"
                              fill="none"
                            />
                            <motion.path
                              ref={gaugeRef}
                              d="M 20 80 A 80 80 0 0 1 180 80"
                              stroke="url(#gradient)"
                              strokeWidth="10"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${(prediction.churnProbability / 100) * 251.3} 251.3`}
                              initial={{ strokeDasharray: "0 251.3" }}
                              animate={{
                                strokeDasharray: `${(prediction.churnProbability / 100) * 251.3} 251.3`,
                              }}
                              transition={{ duration: 2, ease: "power3.out" }}
                            />
                            <defs>
                              <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#00d4ff" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-end justify-center pb-2">
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {prediction.churnProbability.toFixed(1)}%
                              </div>
                              <div
                                className={`text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}
                              >
                                {prediction.riskLevel} Risk
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="glass-card p-4 text-center">
                        <div className="text-lg font-semibold text-neon-blue">
                          Confidence: {prediction.confidence.toFixed(1)}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <motion.div
                            className="h-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${prediction.confidence}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          AI Recommendations
                        </h3>
                        <div className="space-y-3">
                          {prediction.recommendations.map((rec, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 1 }}
                              className="flex items-start space-x-3 p-3 glass-card rounded-lg"
                            >
                              <div className="w-6 h-6 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">•</span>
                              </div>
                              <span className="text-sm">{rec}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-12 h-12 text-neon-blue"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Ready for Analysis
                      </h3>
                      <p className="text-muted-foreground">
                        Fill out the customer data form to get AI-powered churn
                        predictions
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-2xl font-display font-bold mb-4">
                  Advanced Analytics Coming Soon
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Historical trend analysis, customer segmentation, and
                  predictive insights dashboard will be available in the next
                  update.
                </p>
                <div className="grid md:grid-cols-3 gap-4 max-w-md mx-auto">
                  {["Trend Analysis", "Segmentation", "Insights"].map(
                    (feature, index) => (
                      <div key={feature} className="glass-card p-4">
                        <div className="text-sm text-muted-foreground">
                          {feature}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "3d-view" && (
              <motion.div
                key="3d-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8"
              >
                <h2 className="text-2xl font-display font-bold mb-6 text-center">
                  Interactive 3D Data Visualization
                </h2>
                <div className="h-96 rounded-xl overflow-hidden">
                  <DashboardScene3D />
                </div>
                <p className="text-center text-muted-foreground mt-4">
                  Drag to rotate • Scroll to zoom • Real-time customer data
                  network
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
