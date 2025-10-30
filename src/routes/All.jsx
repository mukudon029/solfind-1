import React, { useState, useEffect } from "react";
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";

// PROGRAM_ID and NETWORK configuration
const PROGRAM_ID = new PublicKey(
  "6QfyQYKAUR5rbNgJkLkV4gynvPsbFTcPdQUuZmSVAZMK"
);

const NETWORK = clusterApiUrl("devnet");

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#1a1a2e',
          color: 'white',
          minHeight: '100vh'
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main App Component
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [reportId, setReportId] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [reportPubkey, setReportPubkey] = useState("");
  const [finderPubkey, setFinderPubkey] = useState("");
  const [loading, setLoading] = useState({
    createReport: false,
    releaseReward: false,
    cancelReport: false,
    connecting: false
  });
  const [walletError, setWalletError] = useState(null);

  const notify = (msg) => {
    console.log(`Notification:`, msg);
    alert(msg);
  };

  // Check for wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
          setWalletError(null);
        } catch (err) {
          console.warn("Wallet not connected automatically:", err);
        }
      } else {
        setWalletError("Phantom wallet not detected. Please install Phantom wallet.");
      }
    };
    checkWallet();
  }, []);

  // Initialize program when walletAddress changes
  useEffect(() => {
    if (walletAddress) {
      initProgram();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    setLoading(prev => ({ ...prev, connecting: true }));
    setWalletError(null);
    
    try {
      if (!window.solana) {
        throw new Error("Phantom wallet not installed");
      }
      
      const response = await window.solana.connect();
      setWalletAddress(response.publicKey.toString());
      notify("Wallet connected successfully!");
    } catch (err) {
      const errorMsg = "Wallet connection failed: " + err.message;
      setWalletError(errorMsg);
      notify(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }
      setWalletAddress(null);
      setProgram(null);
      notify("Wallet disconnected");
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const initProgram = async () => {
    try {
      const connection = new Connection(NETWORK, "confirmed");

      // Create proper wallet adapter
      const wallet = {
        publicKey: new PublicKey(walletAddress),
        signTransaction: async (transaction) => {
          return await window.solana.signTransaction(transaction);
        },
        signAllTransactions: async (transactions) => {
          return await window.solana.signAllTransactions(transactions);
        },
      };

      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );

      // Note: You'll need to provide the actual IDL here
      // For now, we'll set program to null and handle the missing IDL
      console.warn("IDL file not provided - program functionality will be limited");
      setProgram(null);
      
    } catch (err) {
      console.error("❌ Error initializing program:", err);
      notify("Error initializing program: " + err.message);
    }
  };

  // Validation functions
  const validatePublicKey = (key) => {
    if (!key || key.trim() === '') return false;
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const validateAmount = (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0 && num <= 1000000000;
  };

  const sanitizeReportId = (input) => {
    return input.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50);
  };

  const handleCreateReport = async () => {
    if (!program || !walletAddress) {
      notify("Program not initialized or wallet not connected");
      return;
    }

    if (!validateAmount(rewardAmount)) {
      notify("❌ Please enter a valid reward amount (0.000000001 to 1 SOL)");
      return;
    }
    if (!reportId.trim()) {
      notify("❌ Please enter a report ID");
      return;
    }

    setLoading(prev => ({ ...prev, createReport: true }));

    try {
      // Simulate transaction since we don't have the actual IDL
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportKeypair = Keypair.generate();
      notify(`✅ Report created (simulated): ${reportKeypair.publicKey.toString()}`);
      
      setReportId("");
      setRewardAmount("");
    } catch (err) {
      notify("❌ Error creating report: " + err.message);
    } finally {
      setLoading(prev => ({ ...prev, createReport: false }));
    }
  };

  const handleReleaseReward = async () => {
    if (!program || !walletAddress) {
      notify("Program not initialized or wallet not connected");
      return;
    }

    if (!validatePublicKey(reportPubkey)) {
      notify("❌ Please provide a valid Report Pubkey");
      return;
    }
    if (!validatePublicKey(finderPubkey)) {
      notify("❌ Please provide a valid Finder Pubkey");
      return;
    }

    setLoading(prev => ({ ...prev, releaseReward: true }));

    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notify(`💰 Reward released to: ${finderPubkey} (simulated)`);
      
      setReportPubkey("");
      setFinderPubkey("");
    } catch (err) {
      notify("❌ Error releasing reward: " + err.message);
    } finally {
      setLoading(prev => ({ ...prev, releaseReward: false }));
    }
  };

  const handleCancelReport = async () => {
    if (!program || !walletAddress) {
      notify("Program not initialized or wallet not connected");
      return;
    }

    if (!validatePublicKey(reportPubkey)) {
      notify("❌ Please provide a valid Report Pubkey");
      return;
    }

    setLoading(prev => ({ ...prev, cancelReport: true }));

    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notify(`🛑 Report canceled: ${reportPubkey} (simulated)`);
      
      setReportPubkey("");
    } catch (err) {
      notify("❌ Error canceling report: " + err.message);
    } finally {
      setLoading(prev => ({ ...prev, cancelReport: false }));
    }
  };

  // Input change handlers
  const handleReportIdChange = (value) => {
    setReportId(sanitizeReportId(value));
  };

  const handleRewardAmountChange = (value) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(Number(value), 1000000000));
    setRewardAmount(numValue.toString());
  };

  // Styling
  const inputStyle = {
    padding: "0.75rem",
    margin: "0.5rem 0",
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #374151",
    backgroundColor: "#1f2937",
    color: "white",
    fontSize: "1rem",
  };

  const buttonStyle = (disabled = false) => ({
    padding: "0.75rem 1.5rem",
    margin: "0.5rem 0",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    width: "100%"
  });

  const sectionStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a2e 0%, #162447 50%, #0f3460 100%)",
          color: "#fff",
          padding: "1rem",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "bold" }}>
              Find My Items
            </h1>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Report lost items and manage rewards on Solana
            </p>
          </header>

          {!walletAddress ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              {walletError && (
                <div style={{ 
                  backgroundColor: "rgba(239, 68, 68, 0.1)", 
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  {walletError}
                </div>
              )}
              
              <button
                style={{ 
                  ...buttonStyle(false),
                  backgroundColor: "#8b5cf6",
                  color: "#fff",
                }}
                onClick={connectWallet}
                disabled={loading.connecting}
              >
                {loading.connecting ? "Connecting..." : "Connect Phantom Wallet"}
              </button>
              
              {!window.solana && (
                <div style={{ marginTop: "1rem" }}>
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: "#8b5cf6", textDecoration: "none" }}
                  >
                    Install Phantom Wallet →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "2rem",
                padding: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px"
              }}>
                <div>
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", opacity: 0.8 }}>
                    Connected Wallet
                  </p>
                  <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {walletAddress.toString().slice(0, 8)}...{walletAddress.toString().slice(-8)}
                  </p>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  Disconnect
                </button>
              </div>

              <div style={sectionStyle}>
                <h2 style={{ margin: "0 0 1rem 0" }}>Create Report</h2>
                <input
                  style={inputStyle}
                  placeholder="Report ID (max 50 chars)"
                  value={reportId}
                  onChange={(e) => handleReportIdChange(e.target.value)}
                />
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="Reward Amount (lamports)"
                  value={rewardAmount}
                  onChange={(e) => handleRewardAmountChange(e.target.value)}
                  min="0"
                  max="1000000000"
                />
                <button
                  style={{
                    ...buttonStyle(!reportId || !rewardAmount || loading.createReport),
                    backgroundColor: "#0ea5e9",
                    color: "#fff",
                  }}
                  onClick={handleCreateReport}
                  disabled={!reportId || !rewardAmount || loading.createReport}
                >
                  {loading.createReport ? "Creating..." : "Create Report"}
                </button>
              </div>

              <div style={sectionStyle}>
                <h2 style={{ margin: "0 0 1rem 0" }}>Release Reward</h2>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                  }}
                  placeholder="Report Pubkey"
                  value={reportPubkey}
                  onChange={(e) => setReportPubkey(e.target.value)}
                />
                <input
                  style={{
                    ...inputStyle,
                    borderColor: validatePublicKey(finderPubkey) ? "#10b981" : "#374151"
                  }}
                  placeholder="Finder Pubkey"
                  value={finderPubkey}
                  onChange={(e) => setFinderPubkey(e.target.value)}
                />
                <button
                  style={{
                    ...buttonStyle(!validatePublicKey(reportPubkey) || !validatePublicKey(finderPubkey) || loading.releaseReward),
                    backgroundColor: "#10b981",
                    color: "#fff",
                  }}
                  onClick={handleReleaseReward}
                  disabled={!validatePublicKey(reportPubkey) || !validatePublicKey(finderPubkey) || loading.releaseReward}
                >
                  {loading.releaseReward ? "Releasing..." : "Release Reward"}
                </button>
              </div>

              <div style={sectionStyle}>
                <h2 style={{ margin: "0 0 1rem 0" }}>Cancel Report</h2>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                  }}
                  placeholder="Report Pubkey"
                  value={reportPubkey}
                  onChange={(e) => setReportPubkey(e.target.value)}
                />
                <button
                  style={{
                    ...buttonStyle(!validatePublicKey(reportPubkey) || loading.cancelReport),
                    backgroundColor: "#ef4444",
                    color: "#fff",
                  }}
                  onClick={handleCancelReport}
                  disabled={!validatePublicKey(reportPubkey) || loading.cancelReport}
                >
                  {loading.cancelReport ? "Canceling..." : "Cancel Report"}
                </button>
              </div>

              <div style={{ 
                ...sectionStyle, 
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                borderColor: "rgba(255, 193, 7, 0.3)"
              }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#ffc107" }}>⚠️ Demo Mode</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
                  This is a demonstration version. Transactions are simulated. 
                  To enable real transactions, provide the program IDL file.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
