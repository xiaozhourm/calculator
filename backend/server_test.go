package main

import (
	"context"
	"testing"

	"calculator/backend/gen/calculator/calculatorconnect"
	"connectrpc.com/connect"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCalculatorServer(t *testing.T) {
	server := &CalculatorServer{}
	client := calculatorconnect.NewCalculatorServiceClient(
		http.DefaultClient,
		"http://localhost:8080",
	)

	tests := []struct {
		name      string
		num1      float64
		num2      float64
		operation string
		expected  float64
		wantErr   bool
	}{
		{"addition", 5, 3, "+", 8, false},
		{"subtraction", 5, 3, "-", 2, false},
		{"multiplication", 5, 3, "*", 15, false},
		{"division", 6, 3, "/", 2, false},
		{"division by zero", 5, 0, "/", 0, true},
		{"invalid operation", 5, 3, "x", 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := connect.NewRequest(&calculator.CalculationRequest{
				Num1:      tt.num1,
				Num2:      tt.num2,
				Operation: tt.operation,
			})
			
			// 测试服务直接调用
			res, err := server.Calculate(context.Background(), req)
			
			if tt.wantErr {
				require.Error(t, err)
				return
			}
			
			require.NoError(t, err)
			assert.Equal(t, tt.expected, res.Msg.Result)
			
			// 测试通过HTTP的实际调用
			if client != nil {
				httpRes, httpErr := client.Calculate(context.Background(), req)
				if tt.wantErr {
					require.Error(t, httpErr)
					return
				}
				require.NoError(t, httpErr)
				assert.Equal(t, tt.expected, httpRes.Msg.Result)
			}
		})
	}
}
