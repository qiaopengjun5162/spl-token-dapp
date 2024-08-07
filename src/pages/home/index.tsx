/* global BigInt */

import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    MINT_SIZE,
    createAssociatedTokenAccountInstruction,
    createInitializeMint2Instruction,
    createMintToInstruction,
    getAccount,
    getAssociatedTokenAddressSync,
    getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import {
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// const TO_PUBLIC_KEY = new PublicKey("EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK");
const TO_PUBLIC_KEY = new PublicKey(
    "6SWBzQWZndeaCKg3AzbY3zkvapCu9bHFZv12iiRoGvCD"
);
// const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_PROGRAM_ID = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
// const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "E7eHC3g4QsFXuaBe3X2wVr54yEvHK8K8fq6qrgB64djx"
);
export default function HomePage() {
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number>(0);
    const [toPublicKey, setToPublicKey] = useState<PublicKey>(TO_PUBLIC_KEY);
    const [toCount, setToCount] = useState(1000000000);
    const { connection } = useConnection();
    const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null);
    const [ataAccount, setAtaAccount] = useState<PublicKey | null>(null);

    const onToPublicKey = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setToPublicKey(new PublicKey(e.target.value));
        } catch (error) {
            console.error("Invalid public key:", e.target.value);
            setToPublicKey(TO_PUBLIC_KEY);
        }
    };

    const onToCount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setToCount(value * LAMPORTS_PER_SOL);
        }
    };

    const onCreateToken = async () => {
        if (!publicKey) {
            enqueueSnackbar("Wallet not connected");
            return;
        }
        const mintKeypair = Keypair.generate();
        setMintKeypair(mintKeypair);
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        console.log("publick:", publicKey);
        console.log(`lamports:${lamports}`);
        console.log(`mint:${mintKeypair.publicKey}`);
        const txInstructions = [
            SystemProgram.createAccount({
                fromPubkey: publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports: lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(
                mintKeypair.publicKey,
                9,
                publicKey,
                publicKey,
                TOKEN_PROGRAM_ID
            ),
        ];

        console.log("txi : ", txInstructions);
        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();
        //let latestBlockhash = await connection.getLatestBlockhash("finalized");
        enqueueSnackbar(
            `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${lastValidBlockHeight}`
        );
        console.log("slot:", minContextSlot);
        console.log("latestBlockhash:", blockhash);

        const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: txInstructions,
        }).compileToV0Message();

        const trx = new VersionedTransaction(messageV0);
        const signature = await sendTransaction(trx, connection, {
            minContextSlot,
            signers: [mintKeypair],
        });
        console.log("signature:", signature);

        enqueueSnackbar(
            `   ✅ - Create Token: 
      ${mintKeypair.publicKey}`
        );
    };

    const onMint = async () => {
        if (!publicKey || !mintKeypair) {
            enqueueSnackbar("Wallet or mint keypair not initialized");
            return;
        }
        const owner = new PublicKey(toPublicKey);
        console.log(owner);
        console.log("mintKeypair:", mintKeypair);
        console.log("mintKeypair:", mintKeypair.publicKey);
        const ataAccount = await getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            owner,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("ata ", ataAccount);
        setAtaAccount(ataAccount);

        let txInstructions = [];
        try {
            await getAccount(connection, ataAccount);
        } catch (error) {
            txInstructions.push(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    ataAccount,
                    owner,
                    mintKeypair.publicKey,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            );
        }
        console.log("toCount:", toCount);
        txInstructions.push(
            createMintToInstruction(
                mintKeypair.publicKey,
                ataAccount,
                publicKey,
                BigInt(toCount)
            )
        );

        console.log("txi : ", txInstructions);
        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();
        //let latestBlockhash = await connection.getLatestBlockhash("finalized");
        enqueueSnackbar(
            `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${lastValidBlockHeight}`
        );
        console.log("slot:", minContextSlot);
        console.log("latestBlockhash:", blockhash);

        const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: txInstructions,
        }).compileToV0Message();

        const trx = new VersionedTransaction(messageV0);
        const signature = await sendTransaction(trx, connection, {
            minContextSlot,
        });
        console.log("signature:", signature);
        console.log(
            `   ✅ - Mint Token ${toCount / LAMPORTS_PER_SOL} to ${ataAccount}`
        );
        enqueueSnackbar(
            `   ✅ - Mint Token ${toCount / LAMPORTS_PER_SOL} to ${ataAccount}`
        );
    };

    const onBalance = async () => {
        if (ataAccount) {
            try {
                const balance = await connection.getTokenAccountBalance(ataAccount);
                console.log("balance:", balance);
                enqueueSnackbar(`${publicKey?.toBase58()} has a balance of ${balance.value.uiAmount}`);
                setBalance(balance.value.uiAmount ?? 0);
            } catch (error) {
                console.error("Error fetching balance:", error);
                enqueueSnackbar("Error fetching balance");
            }
        } else {
            enqueueSnackbar("Associated token account not initialized");
        }
    };

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                pt: 8,
                pb: 6,
            }}
        >
            <Container maxWidth="sm">
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="text.primary"
                    gutterBottom
                >
                    Transfer SPL Token
                </Typography>
                <Typography
                    variant="h5"
                    align="center"
                    color="text.secondary"
                    paragraph

                // Transfer SPL Token with instruction for Token:7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9.
                >
                    Transfer SPL Token with instruction for
                    Token:E7eHC3g4QsFXuaBe3X2wVr54yEvHK8K8fq6qrgB64djx.
                </Typography>

                <Stack
                    sx={{ pt: 4 }}
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                >
                    <Container>
                        <React.Fragment>
                            <Button onClick={onCreateToken}> CreateToken</Button>
                        </React.Fragment>
                        <br />

                        <React.Fragment>
                            <div>
                                <TextField label="To" onChange={onToPublicKey} />
                                <TextField label="Count" onChange={onToCount} />
                                <Button onClick={onMint}> Mint </Button>
                            </div>
                        </React.Fragment>

                        <React.Fragment>
                            <span>Balance:{balance} </span>
                            <Button onClick={onBalance}> Query Balance </Button>
                        </React.Fragment>
                    </Container>
                </Stack>
            </Container>
        </Box>
    );
}
