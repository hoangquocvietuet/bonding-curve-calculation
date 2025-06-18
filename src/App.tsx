import { useEffect, useState } from "react";
import "./App.css";
import { generateSampleData } from "./sample";

const SALE_AMOUNT = 800_000_000;
const LIQUIDITY_AMOUNT = 200_000_000;

function calculateVirtualQuoteAmount(
	virtualBaseAmount: number,
	raiseAmount: number
) {
	return Math.round((virtualBaseAmount * SALE_AMOUNT) / raiseAmount);
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
	const [virtualBaseAmount, setVirtualBaseAmount] = useState<string>("9");
	const [currentRaise, setCurrentRaise] = useState<string>("0");
	const [amountIn, setAmountIn] = useState<string>("0");
	const [targetRaiseAmount, setTargetRaiseAmount] = useState<string>("24");
	const [virtualQuoteAmount, setVirtualQuoteAmount] = useState<string>(
		calculateVirtualQuoteAmount(Number(virtualBaseAmount), Number(targetRaiseAmount)).toString()
	);
	const [amountOut, setAmountOut] = useState<string>("0");
	const [canCoverCurve, setCanCoverCurve] = useState<boolean>(false);
	
	const [K, setK] = useState<number>(
		Number(virtualBaseAmount) * (SALE_AMOUNT + Number(virtualQuoteAmount))
	);
	const [tokenSaleLeft, setTokenSaleLeft] = useState<number>(SALE_AMOUNT);
	const [sampleData, setSampleData] = useState<{
		actions: { user: number; type: string; amount: number; amountOut: number; currentRaise: number; tokenLeft: number; }[];
		refundAmount: { user: number, refund: number, amountCommit: number, tokenBought: number, averagePrice: number }[];
	}>({
		actions: [],
		refundAmount: [],
	});
	const [numberOfUsers, setNumberOfUsers] = useState<number>(20);

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

	useEffect(() => {
		setSampleData(generateSampleData({
			targetRaise: Number(targetRaiseAmount),
			virtualBase: Number(virtualBaseAmount),
			virtualQuote: Number(virtualQuoteAmount),
			numberOfUsers: numberOfUsers,
		}));
	}, [targetRaiseAmount, virtualBaseAmount, virtualQuoteAmount, numberOfUsers]);


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
				<p>Last bonding curve price: 1 x = {Math.floor(Number(virtualQuoteAmount) / (Number(targetRaiseAmount) + Number(virtualBaseAmount)))} y</p>
				<p>Listing price: 1 x = {Math.floor(Number(LIQUIDITY_AMOUNT) / (Number(targetRaiseAmount)))} y</p>
			</div>
			<div>
				<h2>Sample Data</h2>
				{/* number of actions */}
				<p>Number of actions: {sampleData.actions.length}</p>
				<input type="number" value={numberOfUsers} onChange={(e) => setNumberOfUsers(Number(e.target.value))} />
				<table className="styled-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Type</th>
							<th>Amount</th>
							<th>Amount Out</th>
							<th>Current Raise</th>
							<th>Token Left</th>
						</tr>
					</thead>
					<tbody>
						{sampleData.actions.map((data, index) => (
							<tr key={index}>
								<td>{data.user}</td>
								<td>{data.type}</td>	
								<td>{data.amount}</td>
								<td>{data.amountOut}</td>
								<td>{data.currentRaise}</td>
								<td>{data.tokenLeft}</td>
							</tr>
						))}
					</tbody>
				</table>
				<table className="styled-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Refund BNB</th>
							<th>Token</th>
							<th>BNB Bought</th>
							<th>Average Price (scale 1e18)</th>
						</tr>
					</thead>
					<tbody>
						{sampleData.refundAmount.map((data, index) => (
							<tr key={index}>
								<td>{data.user}</td>
								<td>{data.refund}</td>
								<td>{data.amountCommit}</td>
								<td>{data.tokenBought}</td>
								<td>{data.averagePrice}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</div>
	);
}

export default App;