// eslint-disable-next-line
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
//import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import Header from "@components/header";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolongWalletAdapter } from "@solana/wallet-adapter-solong";
import { clusterApiUrl } from "@solana/web3.js";
import { SnackbarProvider } from "notistack";
import Footer from "../components/footer";

// Define props interface
interface LayoutProps {
    children: React.ReactNode;
    customHeaderButton?: React.ReactNode; // Make this prop optional
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const Layout: React.FC<LayoutProps> = ({ children, customHeaderButton }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallets = [new SolongWalletAdapter(), new PhantomWalletAdapter()];
    // const { publicKey, sendTransaction } = useWallet();

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ThemeProvider theme={defaultTheme}>
                        <SnackbarProvider maxSnack={10}>
                            <CssBaseline />

                            <Header customButton={customHeaderButton} />
                            <div className="container" style={{ minHeight: "600px" }}>
                                {children}
                            </div>

                            <Footer />
                        </SnackbarProvider>
                    </ThemeProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default Layout;
