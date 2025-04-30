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

  const calculate = async () => {
    try {
      setError("");
      const transport = createConnectTransport({
        baseUrl: "http://localhost:8080",
      });
      const client = createPromiseClient(CalculatorService, transport);
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
          {/* 保持原有的JSX */}
        </div>
      </div>
    </div>
  );
}
