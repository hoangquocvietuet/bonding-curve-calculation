import { useEffect, useState } from "react";
import "./App.css";

const SALE_AMOUNT = 800_000_000;
const LIQUIDITY_AMOUNT = 200_000_000;

function calculateVirtualQuoteAmount(
	virtualBaseAmount: number,
	raiseAmount: number
) {
	return ((virtualBaseAmount + raiseAmount) * LIQUIDITY_AMOUNT) / raiseAmount;
}

function calculateAmountOut(
	K: number,
	amountIn: number,
	currentRaise: number,
	virtualBaseAmount: number,
	virtualQuoteAmount: number
) {
	const tokenSaleLeftBefore =
		K / (currentRaise + virtualBaseAmount) - virtualQuoteAmount;
	const tokenSaleLeftNew =
		K / (currentRaise + amountIn + virtualBaseAmount) - virtualQuoteAmount;
	return tokenSaleLeftBefore - tokenSaleLeftNew;
}

function App() {
	const [virtualBaseAmount, setVirtualBaseAmount] = useState<string>("10");
	const [currentRaise, setCurrentRaise] = useState<string>("0");
	const [amountIn, setAmountIn] = useState<string>("0");
	const [targetRaiseAmount, setTargetRaiseAmount] = useState<string>("10");
	const [virtualQuoteAmount, setVirtualQuoteAmount] = useState<string>(
		calculateVirtualQuoteAmount(Number(virtualBaseAmount), Number(targetRaiseAmount)).toString()
	);
	const [amountOut, setAmountOut] = useState<string>("0");
	const [canCoverCurve, setCanCoverCurve] = useState<boolean>(false);
	
	const [K, setK] = useState<number>(
		Number(virtualBaseAmount) * (SALE_AMOUNT + Number(virtualQuoteAmount))
	);
	const [tokenSaleLeft, setTokenSaleLeft] = useState<number>(SALE_AMOUNT);

	useEffect(() => {
		setVirtualQuoteAmount(
			calculateVirtualQuoteAmount(Number(virtualBaseAmount), Number(targetRaiseAmount)).toString()
		);
		setK(Number(virtualBaseAmount) * (SALE_AMOUNT + Number(virtualQuoteAmount)));
	}, [virtualBaseAmount, targetRaiseAmount, virtualQuoteAmount]);

	useEffect(() => {
		setAmountOut(calculateAmountOut(K, Number(amountIn), Number(currentRaise), Number(virtualBaseAmount), Number(virtualQuoteAmount)).toString());
	}, [K, amountIn, currentRaise, virtualBaseAmount, virtualQuoteAmount]);

	useEffect(() => {
		console.log(virtualQuoteAmount, SALE_AMOUNT, virtualBaseAmount);
		const tokenSaleLeft = K / (Number(currentRaise) + Number(virtualBaseAmount)) - Number(virtualQuoteAmount);
		setTokenSaleLeft(tokenSaleLeft);
	}, [K, currentRaise, virtualBaseAmount, virtualQuoteAmount]);

	useEffect(() => {
		const amountOut = calculateAmountOut(K, Number(targetRaiseAmount) - Number(currentRaise), Number(currentRaise), Number(virtualBaseAmount), Number(virtualQuoteAmount));
		setCanCoverCurve(amountOut >= tokenSaleLeft);
	}, [amountOut, virtualQuoteAmount, currentRaise, virtualBaseAmount, K, tokenSaleLeft]);

	const progress = (Number(currentRaise) / Number(targetRaiseAmount)) * 100 || 0;

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

			
			<div className="result">
				<h2>Results:</h2>
				<div>Formula: (x + {virtualBaseAmount}) * (y + {virtualQuoteAmount}) = {K}</div>
				<p>Virtual Quote Amount: {virtualQuoteAmount}</p>
				<p>Amount Out: {amountOut}</p>
				<p>Can cover curve: {canCoverCurve ? "Yes" : "No"}</p>
				<p>Token sale left: {tokenSaleLeft}</p>
		</div>
		</div>
	);
}

export default App;
