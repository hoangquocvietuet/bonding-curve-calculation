const SALE_AMOUNT = 800_000_000;

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateSampleData = ({
    targetRaise,
    virtualBase,
    virtualQuote,
    numberOfUsers
}: {
    targetRaise: number;
    virtualBase: number;
    virtualQuote: number;
    numberOfUsers: number;
}) => {
    const K = virtualBase * (virtualQuote + SALE_AMOUNT);    
    // console.log(K);
    let currentRaise = 0;
    let tokenLeft = SALE_AMOUNT;
    
    let users: { user: number, buyAmount: number, amountOut: number }[] = [];
    const actions = [];
    let index = 0;
    for (let i = 0; i < numberOfUsers; i ++) {

        let newBuy = true;
        if (currentRaise == targetRaise) {
            newBuy = false;
        }
        if (users.length > 0 && getRandomInt(0, 1) == 0) {
            newBuy = false;
        } else {
            newBuy = true;
        }

        if (newBuy) {
            const buyAmount = getRandomInt(1, Math.min(targetRaise, 5));
            const newTokenLeft = Math.floor(K / (currentRaise + buyAmount + virtualBase)) - virtualQuote;
            users.push({
                user: index,
                buyAmount,
                amountOut: tokenLeft - newTokenLeft,
            });
            const amountOut = tokenLeft - newTokenLeft;
            tokenLeft = newTokenLeft;
            currentRaise += buyAmount;
            actions.push({
                user: index ++,
                type: 'buy',
                amount: buyAmount,
                amountOut,
                currentRaise,
                tokenLeft,
            });
        } else {
            const sellIndex = getRandomInt(0, users.length - 1);

            const sellAmount = users[sellIndex].amountOut;
            const newCurrentRaise = Math.floor(K / (virtualQuote + tokenLeft + sellAmount)) - virtualBase;
            const amountOut = currentRaise - newCurrentRaise;
            currentRaise = newCurrentRaise;
            tokenLeft = tokenLeft + sellAmount;
            actions.push({
                user: users[sellIndex].user,
                type: 'sell',
                amount: sellAmount,
                amountOut,
                currentRaise,
                tokenLeft,
            });
            users = users.filter((user) => user.user !== users[sellIndex].user);
        }
    }

    const commit: Map<number, number> = new Map();
    const tokenBought: Map<number, number> = new Map();
    for (const user of users) {
        commit.set(user.user, commit.get(user.user) || 0 + user.amountOut);
        tokenBought.set(user.user, tokenBought.get(user.user) || 0 + user.buyAmount);
    }
    // loop the map and calculate the average price
    const weightUsers: Map<number, number> = new Map();
    const meanAvgPrice = currentRaise * 1e18 / (SALE_AMOUNT - tokenLeft);
    for (const [user, amountCommit] of commit) {
        const token = tokenBought.get(user) || 0;
        if (token > 0) {
            const averagePrice = token * 10 ** 18 / amountCommit;
            const weight = Math.floor(token * averagePrice * 1e18 / meanAvgPrice);
            weightUsers.set(user, weight);
        }
    }
    const sumWeight = Array.from(weightUsers.values()).reduce((a, b) => a + b, 0);
    console.log(currentRaise);
    const refundAmount: { user: number, refund: number, amountCommit: number, tokenBought: number, averagePrice: number }[] = [];
    for (const [user, weight] of weightUsers) {
        const refund = Math.floor(weight * currentRaise * 10 ** 18 / sumWeight) / 10 ** 18;
        const amountCommit = commit.get(user) || 0;
        const token = tokenBought.get(user) || 0;
        const averagePrice = token * 1e18 / amountCommit;
        refundAmount.push({
            user,
            refund,
            amountCommit,
            tokenBought: token,
            averagePrice,
        });        
    }

    return {
        actions,
        refundAmount,
    };
}