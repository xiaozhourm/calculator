package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

	"calculator-project/backend/gen/calculator/calculatorconnect"
	"connectrpc.com/connect"
)
import "github.com/rs/cors"

type CalculatorServer struct{}

func (s *CalculatorServer) Calculate(
	ctx context.Context,
	req *connect.Request[calculator.CalculationRequest],
) (*connect.Response[calculator.CalculationResponse], error) {
	num1 := req.Msg.Num1
	num2 := req.Msg.Num2
	operation := req.Msg.Operation

	var result float64
	switch operation {
	case "+":
		result = num1 + num2
	case "-":
		result = num1 - num2
	case "*":
		result = num1 * num2
	case "/":
		if num2 == 0 {
			return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("division by zero"))
		}
		result = num1 / num2
	default:
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("invalid operation"))
	}

	res := connect.NewResponse(&calculator.CalculationResponse{
		Result: result,
	})
	return res, nil
}

func main() {
// 跨域
handler := cors.Default().Handler(mux)
log.Fatal(http.ListenAndServe(":8080", handler))

	calculator := &CalculatorServer{}
	mux := http.NewServeMux()
	path, handler := calculatorconnect.NewCalculatorServiceHandler(calculator)
	mux.Handle(path, handler)
	fmt.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
