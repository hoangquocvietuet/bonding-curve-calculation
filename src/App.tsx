import { useEffect, useState } from "react";
import "./App.css";

const SALE_AMOUNT = 800_000_000;
const LIQUIDITY_AMOUNT = 200_000_000;

function calcParameters(virtualBaseAmount: number, raiseAmount: number) {
	return ((virtualBaseAmount + raiseAmount) * LIQUIDITY_AMOUNT) / raiseAmount;
}

function calculateAmountOut(
	amountIn: number,
	currentRaise: number,
	tokenSaleLeft: number,
	virtualBaseAmount: number,
	virtualQuoteAmount: number
) {
	const K =
		(currentRaise + virtualBaseAmount) * (tokenSaleLeft + virtualQuoteAmount);
	const newX = currentRaise + amountIn + virtualBaseAmount;
	const newY = K / newX;
	const newTokenSaleLeft = newY - virtualQuoteAmount;
	console.log(newTokenSaleLeft);
	if (tokenSaleLeft < newTokenSaleLeft) {
		throw new Error("Some thing fail");
	}
	return tokenSaleLeft - newTokenSaleLeft;
}

function App() {
	const [virtualBaseAmount, setVirtualBaseAmount] = useState<string>("");
	const [currentRaise, setCurrentRaise] = useState<string>("0");
	const [amountIn, setAmountIn] = useState<string>("");
	const [virtualQuoteAmount, setVirtualQuoteAmount] = useState<number | null>(
		null
	);
	const [amountOut, setAmountOut] = useState<number | null>(null);
	const [targetRaiseAmount, setTargetRaiseAmount] = useState<string>("");
	const [tokenSaleLeft, setTokenSaleLeft] = useState<string>(
		SALE_AMOUNT.toString()
	);

	const handleCalculate = () => {
		const baseAmount = parseFloat(virtualBaseAmount);
		const raise = parseFloat(currentRaise);

		if (!isNaN(baseAmount) && !isNaN(raise)) {
			const virtualQuoteAmount = calcParameters(
				baseAmount,
				parseFloat(targetRaiseAmount)
			);
			setVirtualQuoteAmount(virtualQuoteAmount);

			if (amountIn) {
				const out = calculateAmountOut(
					parseFloat(amountIn),
					raise,
					parseFloat(tokenSaleLeft),
					parseFloat(virtualBaseAmount),
					virtualQuoteAmount
				);
				setAmountOut(out);
			}
		}
	};

	useEffect(() => {
		if (currentRaise && amountIn && virtualBaseAmount && virtualQuoteAmount) {
			const K =
				parseFloat(virtualBaseAmount) * (SALE_AMOUNT + virtualQuoteAmount);
			const tokenSaleLeft =
				K / (parseFloat(currentRaise) + parseFloat(virtualBaseAmount)) -
				virtualQuoteAmount;
			setTokenSaleLeft(tokenSaleLeft.toString());
		}
	}, [currentRaise, amountIn, virtualBaseAmount, virtualQuoteAmount]);

	const progress =
		(parseFloat(currentRaise) / parseFloat(targetRaiseAmount)) * 100 || 0;

	return (
		<div className="container">
			<h1>Bonding Curve Calculator</h1>

			<div className="progress-container">
				<div className="progress-label">
					<span>Progress: {progress.toFixed(2)}%</span>
					<span>
						{currentRaise} / {targetRaiseAmount.toLocaleString()}
					</span>
				</div>
				<div className="progress-bar">
					<div
						className="progress-fill"
						style={{ width: `${Math.min(100, progress)}%` }}
					></div>
				</div>
			</div>

			<div className="input-group">
				<label>
					Virtual Base Amount:
					<input
						type="number"
						value={virtualBaseAmount}
						onChange={(e) => setVirtualBaseAmount(e.target.value)}
						placeholder="Enter virtual base amount"
					/>
				</label>
			</div>

			<div className="input-group">
				<label>
					Current raise amount:
					<input
						type="number"
						value={currentRaise}
						onChange={(e) => setCurrentRaise(e.target.value)}
						placeholder="Enter current raise amount"
					/>
				</label>
			</div>

			<div className="input-group">
				<label>
					Target raise amount:
					<input
						type="number"
						value={targetRaiseAmount}
						onChange={(e) => setTargetRaiseAmount(e.target.value)}
						placeholder="Enter target raise amount"
					/>
				</label>
			</div>

			<div className="input-group">
				<label>
					Amount In:
					<input
						type="number"
						value={amountIn}
						onChange={(e) => setAmountIn(e.target.value)}
						placeholder="Enter amount to swap"
					/>
				</label>
			</div>

			<button onClick={handleCalculate}>Calculate</button>

			{virtualQuoteAmount !== null && (
				<div className="result">
					<h2>Results:</h2>
					<p>Virtual Quote Amount: {virtualQuoteAmount.toFixed(10)}</p>
					{amountOut !== null && <p>Amount Out: {amountOut.toFixed(10)}</p>}
				</div>
			)}
		</div>
	);
}

export default App;
