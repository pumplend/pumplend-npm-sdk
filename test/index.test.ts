import { Pumplend } from "../src";

import { Keypair,LAMPORTS_PER_SOL, PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Connection,
  clusterApiUrl,
  TransactionInstruction,
  Struct,
  SendTransactionError,
} from "@solana/web3.js";
import {
mintTo,
TOKEN_PROGRAM_ID,
TOKEN_2022_PROGRAM_ID,
ASSOCIATED_TOKEN_PROGRAM_ID,
createAssociatedTokenAccount,
getAssociatedTokenAddressSync,
getAssociatedTokenAddress,
createInitializeMintInstruction,
getMintLen,
getOrCreateAssociatedTokenAccount,
getAccount,
createAssociatedTokenAccountInstruction

} from "@solana/spl-token";
import { getDefaultPool  , addressFetch}from "@pumplend/raydium-js-sdk"

import * as dotenv from 'dotenv';
dotenv.config();

import bs58 from 'bs58'
const connection = new Connection('https://api.devnet.solana.com');
const mainnet = new Connection('https://api.mainnet-beta.solana.com')
//init
jest.setTimeout(36000000)


const sk = process.env.SK?process.env.SK:"";
const kp = Keypair.fromSecretKey(bs58.decode(sk));
const testUser = kp.publicKey;
const mainnetToken = new PublicKey('Eq1Wrk62j2F2tLf9XfdBssYJVr5k8oLJx3pqEL1rpump')
const devnetToken = new PublicKey('HojdYxukWVZZ38hiZHoqxQD2uHfN2JoZ1EsDeMQDSchD')

const testControl = {
  dataFetch : false,
  pumpBuy : false,
  pumpSell: false,
  pumpCreate:false,
  pumplendStake:false,
  pumplendWithdraw:false,
  pumplendBorrow : false,
  pumplendRepay : false,
  pumplendLeverage : false,
  pumplendLeverageRay : false,
  pumplendCloseInPump : false,
  pumplendCloseInRay : false,
  pumplendMaxBorrowCul:false,
  pumplendMaxLeverageCul:false,
  contractInit:false,
  updateVault:false,
  updateFeeRate:false,
}


test("🍺 Test Data Fetch", async () => {
  if(testControl.dataFetch)
  {
    // const lend = new Pumplend("devnet",new PublicKey("EZ1shj1LUqmKRms2snKoumCWYGDnwxwedpBgCQP7b9yV"))
    const lend = new Pumplend("devnet")
    console.log(
      "Account information ::",kp.publicKey.toBase58()
    )
    // console.log(
    //   lend.tryGetUserAccounts(kp.publicKey)
    // )
    console.log(
      "get user borrow account",
      lend.tryGetUserTokenAccounts(kp.publicKey,devnetToken)
    )
    console.log(
      "Get some data ::",
      await lend.tryGetUserStakingData(connection,testUser),
      "systemconfig::",
      await lend.tryGetSystemConfigData(connection),
      await lend.tryGetPoolStakingData(connection),
      lend.tryGetUserAccounts(testUser),
    )

    console.log("Token info :: ",
      await connection.getAccountInfo(
        getAssociatedTokenAddressSync(devnetToken,kp.publicKey)
      )
    )
    console.log("Mainnet info :: ",
      await mainnet.getAccountInfo(testUser)
    )
  
    const borrowData = await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    console.log(
      borrowData,

      "Position Liquite & Interest ::",lend.pumplend_estimate_interest(
        borrowData
      )
    )

    const mainnetLend = new Pumplend("mainnet");
    console.log("curve :: ",
      await mainnetLend.tryGetPumpTokenCurveData(mainnet,new PublicKey("GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump"))
    )

    console.log(
      "userBorrowData",
      await mainnetLend.tryGetUserBorrowData(
        mainnet,
        new PublicKey("GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump"),
        new PublicKey("Ge3vpViqwz4fvx2EAZPsAfvUiwh7PajvTsZtKW33nMmE"),

      )
    )

  }else{
    console.info("⚠Test Module Off")
  }
})




test("🍺 Test Pumpfun Buy Mainnet", async () => {
  if(testControl.pumpBuy)
  {
  /**
   * Test Pump Token Buy
   * 
   */
  const lend = new Pumplend("devnet")
  const associatedUser = getAssociatedTokenAddressSync(devnetToken, testUser);
  const pumpTokenAccountTxn = createAssociatedTokenAccountInstruction(testUser,associatedUser,testUser,devnetToken)
  let tx = new Transaction();
  // tx.add(pumpTokenAccountTxn);
  const pumpBuyTokenTx = await lend.pump_buy(
    devnetToken,
    testUser,
    21598402000000,
    1e9
  );
  if(pumpBuyTokenTx)
  {
    tx.add(
      pumpBuyTokenTx
    )
    const simulate = await connection.simulateTransaction(
      tx,
      [kp],
      [kp.publicKey],
    );

    console.log("Pump token buy mainnet simulate ::",simulate);
    tx = lend.txTips(tx,simulate,500);
    console.log(
      "Pump token buy mainnet ::",tx,
      await connection.sendTransaction(tx,[kp])
    )
  }else{
    console.log(pumpBuyTokenTx)
  }
  }else{
    console.info("⚠Test Module Off")
  }

})

test("🍺 Test Pumpfun Sell Mainnet", async () => {
if(testControl.pumpSell)
{
  /**
 * Test Pump Token Sell
 */
const lend = new Pumplend()
let tx = new Transaction();
const pumpSellTokenTx = await lend.pump_sell(
  mainnetToken,
  testUser,
  1e7,
  0,
  
);
if(pumpSellTokenTx)
{
  tx.add(
    pumpSellTokenTx
  )
  const simulate = await mainnet.simulateTransaction(
    tx,
    [kp],
    [kp.publicKey],
  );

  console.log("Pump token sell mainnet simulate ::",simulate);
  tx = lend.txTips(tx,simulate,500);

  console.log(
    "Pump token sell mainnet ::",tx,
    await mainnet.sendTransaction(tx,[kp])
  )
}else{
  console.log(pumpSellTokenTx)
}
}
})

test("🍺 Test Pumplend Stake", async () => {
  if(testControl.pumplendStake)
  {
    const lend = new Pumplend("devnet")
    console.log(

    );
    const stakeTx = await lend.stake(1e9,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    if(stakeTx)
      {
        tx.add(
          stakeTx
        )
        console.log(
          "Pumplend stake devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(stakeTx)
      }
    console.log(
      "Staking data ::",await lend.tryGetUserStakingData(connection,kp.publicKey)
    )
  
  }else{
    console.info("⚠Test Module Off")
  }
})


test("🍺 Test Pumplend Withdraws", async () => {
  if(testControl.pumplendWithdraw)
  {
    const lend = new Pumplend("devnet")
    const withdrawTx = await lend.withdraw(99999790,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    if(withdrawTx)
      {
        tx.add(
          withdrawTx
        )
        console.log(
          "Pumplend withdraws devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(withdrawTx)
      }
    console.log(
      "Withdraws data ::",await lend.tryGetUserStakingData(connection,kp.publicKey)
    )
  
  }else{
    console.info("⚠Test Module Off")
  }
})



test("🍺 Test Pumplend Borrow", async () => {
  if(testControl.pumplendBorrow)
  {
    const lend = new Pumplend("devnet")
    const borrowTx = await lend.borrow(5000000*1e6,devnetToken,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    const associatedUser = getAssociatedTokenAddressSync(devnetToken, kp.publicKey);
    const pumpTokenAccountTxn = createAssociatedTokenAccountInstruction(kp.publicKey,associatedUser,kp.publicKey,devnetToken)
    if(borrowTx)
      {
        // tx.add(
        //   pumpTokenAccountTxn
        // )
        tx.add(
          borrowTx
        )
        console.log(
          "Pumplend borrow devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(borrowTx)
      }
    console.log(
      "Borrow data ::",await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    )
  
  }else{
    console.info("⚠Test Module Off")
  }
})



test("🍺 Test Pumplend Repay", async () => {
  if(testControl.pumplendRepay)
  {
    const lend = new Pumplend("devnet")
    const borrowData = await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    console.log(
      "Borrow data ::",borrowData
    )
  

    if(!borrowData)
    {
      return false;
    }

    const repayTx = await lend.repay(Number(borrowData.borrowedAmount),devnetToken,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    if(repayTx)
      {
        tx.add(
          repayTx
        )
        console.log(
          "Pumplend repay devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(repayTx)
      }

  }else{
    console.info("⚠Test Module Off")
  }
})

test("🍺 Test Pumplend Leverage", async () => {
  if(testControl.pumplendLeverage)
  {
    const lend = new Pumplend("devnet")
    const borrowTx = await lend.leverage_pump(1e8,devnetToken,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    const associatedUser = getAssociatedTokenAddressSync(devnetToken, kp.publicKey);
    const pumpTokenAccountTxn = createAssociatedTokenAccountInstruction(kp.publicKey,associatedUser,kp.publicKey,devnetToken)
    if(borrowTx)
      {
        // tx.add(
        //   pumpTokenAccountTxn
        // )
        tx.add(
          borrowTx
        )
        console.log(
          "Pumplend leverage devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(borrowTx)
      }
    console.log(
      "Borrow data ::",await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    )
  
  }else{
    console.info("⚠Test Module Off")
  }
})

test("🍺 Test Pumplend Leverage", async () => {
  if(testControl.pumplendLeverageRay)
  {
    const lend = new Pumplend("devnet")

    const borrowTx = await lend.leverage_raydium(
      connection,1e8,devnetToken,new PublicKey('885XNKURTvUzw8CcrM6oGnjP2wht5VgA4U7P44ExHvc9'),kp.publicKey,kp.publicKey
    )
    const tx = new Transaction();
    const associatedUser = getAssociatedTokenAddressSync(devnetToken, kp.publicKey);
    const pumpTokenAccountTxn = createAssociatedTokenAccountInstruction(kp.publicKey,associatedUser,kp.publicKey,devnetToken)
    if(borrowTx)
      {
        // tx.add(
        //   pumpTokenAccountTxn
        // )
        tx.add(
          borrowTx
        )
        console.log(
          "Pumplend leverage devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(borrowTx)
      }
    console.log(
      "Borrow data ::",await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    )
  
  }else{
    console.info("⚠Test Module Off")
  }
})



test("🍺 Test Pumplend Close Position", async () => {
  if(testControl.pumplendCloseInPump)
  {
    const lend = new Pumplend("devnet")
    const borrowData = await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    console.log(
      "Borrow data ::",borrowData
    )
  

    if(!borrowData)
    {
      return false;
    }

    const repayTx = await lend.close_pump(devnetToken,kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    if(repayTx)
      {
        tx.add(
          repayTx
        )
        console.log(
          "Pumplend repay devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(repayTx)
      }

  }else{
    console.info("⚠Test Module Off")
  }
})

test("🍺 Test Raydium Close Position", async () => {
  if(testControl.pumplendCloseInRay)
  {
    const lend = new Pumplend("devnet")
    // console.log("Try log sth ")
    // console.log(devnetToken.toBase58(),kp.publicKey.toBase58())
    const borrowData = await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey)
    console.log(
      "Borrow data ::",borrowData
    )
  

    if(!borrowData)
    {
      return false;
    }

    const repayTx = await lend.close_raydium(connection,devnetToken,new PublicKey('885XNKURTvUzw8CcrM6oGnjP2wht5VgA4U7P44ExHvc9'),kp.publicKey,kp.publicKey);
    const tx = new Transaction();
    if(repayTx)
      {
        tx.add(
          repayTx
        )
        console.log(
          "Pumplend repay devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(repayTx)
      }

  }else{
    console.info("⚠Test Module Off")
  }
})


test("🍺 Test Max Borrow", async () => {
  if(testControl.pumplendMaxBorrowCul)
  {
    const lend = new Pumplend("devnet")
    const borrowData =  await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey);
    console.log("borrowData",borrowData)
    console.log(
      "Max Borrow ::",lend.pumplend_culcuate_max_borrow(
        // borrowData
        {}
       ,
        1e10
        ,
        await lend.tryGetPoolStakingData(connection)
      )
    )
    if(!borrowData)
    {
      return false;
    }
      console.log(
      "Position Liquite & Interest ::",lend.pumplend_estimate_interest(
        borrowData
      )
    )
  }else{
    console.info("⚠Test Module Off")
  }
})

test("🍺 Test Max Leverage", async () => {
  if(testControl.pumplendMaxLeverageCul)
  {
    // const lend = new Pumplend("devnet")
    const lend = new Pumplend("mainnet")
    //Check if token exsit on raydium 
    const mt = new PublicKey("BSqMUYb6ePwKsby85zrXaDa4SNf6AgZ9YfA2c4mZpump")
    let curve = await lend.tryGetPumpTokenCurveData(mainnet,mt)
    console.log(curve)
    if(curve && curve.complete == BigInt(1))
    {
        const pools = await getDefaultPool(mt,PublicKey.default,"mainnet")
        console.log("pools ::",pools)
        if(pools)
        {
          const pool = JSON.parse(
            JSON.stringify(
              pools
            )
          )
            curve = {
              virtualTokenReserves: BigInt(
                Math.floor(Number(pool.mintAmountB)*(Math.pow(10,6)))
              ),
              virtualSolReserves:BigInt(
                Math.floor(Number(pool.mintAmountA)*(Math.pow(10,9)))
              ),
              realTokenReserves: BigInt(
                Math.floor(Number(pool.mintAmountB)*(Math.pow(10,6)))
              ),
              realSolReserves: BigInt(0),
              tokenTotalSupply:BigInt(0),
              complete: BigInt(1),
            }
        }
    }else{
      //Do nothing , curve  works fine
    }

    // const borrowData =  await lend.tryGetUserBorrowData(connection,devnetToken,kp.publicKey);

    // const curve = await lend.tryGetPumpTokenCurveData(connection,devnetToken)
    // console.log("CurveData :: ",curve)
    const borrowData =  {};
    // const curve = {}

    console.log("borrowData",borrowData,curve)
    console.log(
      "Max Leverage ::",lend.pumplend_culcuate_max_leverage(
        borrowData
       ,
        10*1e9
        ,
        curve
      )
    )

    console.log(
      "Try do that in once ::",
      await lend.pumplend_culcuate_max_leverageable(
        mainnet,
        mt,
        kp.publicKey,
        10*1e9
      )
    )
  }else{
    console.info("⚠Test Module Off")
  }
})

test("🍺 Reinit Pumpmax Contract", async () => {
  if(testControl.contractInit)
  {
    console.log(kp.secretKey.toString())
    const lend = new Pumplend("mainnet",new PublicKey("41LsHyCYgo6VPuiFkk8q4n7VxJCkcuEBEX99hnCpt8Tk"))
    const initTxn = await lend.init(
      new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
      BigInt(1157400),
      new PublicKey("zzntY4AtoZhQE8UnfUoiR4HKK2iv8wjW4fHVTCzKnn6"),
      kp.publicKey)
    console.log(initTxn)
    const tx = new Transaction();
    if(initTxn)
      {
        tx.add(
          initTxn
        )
        console.log(
          "Pumplend initTxn devnet ::",tx,
          await connection.sendTransaction(tx,[kp])
        )
      }else{
        console.log(initTxn)
      }

  }else{
    console.info("⚠Test Module Off")
  }
})