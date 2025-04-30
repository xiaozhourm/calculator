"use client";

import { useState } from "react";
import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CalculatorService } from "./gen/calculator/calculator_connect";
import { CalculationRequest } from "./gen/calculator/calculator_pb";

export default function Calculator() {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [operation, setOperation] = useState("+");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const transport = createConnectTransport({
    baseUrl: "http://localhost:8080",
  });

  const client = createPromiseClient(CalculatorService, transport);

  const calculate = async () => {
    try {
      setError("");
      const request = new CalculationRequest({
        num1: parseFloat(num1),
        num2: parseFloat(num2),
        operation,
      });
      const response = await client.calculate(request);
      setResult(response.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Calculator</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Number
            </label>
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Second Number
            </label>
            <input
              type="number"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={calculate}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Calculate
          </button>
          
          {result !== null && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-lg font-semibold">Result: {result}</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              <p>Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
