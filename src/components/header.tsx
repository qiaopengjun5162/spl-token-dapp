// eslint-disable-next-line
import { AllInbox } from "@mui/icons-material";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header({ customButton }) {
    return (
        <AppBar position="relative">
            <Toolbar>
                <AllInbox sx={{ mr: 4 }} />
                <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                    TransferDemo
                </Typography>
                {customButton ? customButton : <WalletMultiButton />}
            </Toolbar>
        </AppBar>
    );
}
