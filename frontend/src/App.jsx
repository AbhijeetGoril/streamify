import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom"; // Add this import
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import OnBoradingPage from "./pages/OnBoradingPage";
import CallPage from "./pages/CallPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axois";

// Add these imports for verification pages
import VerifyInstructionsPage from "./pages/VerifyEmailPages.jsx/VerifyInstructionsPage";
import VerificationSuccessPage from "./pages/VerifyEmailPages.jsx/VerificationSuccessPage";
import VerificationFailedPage from "./pages/VerifyEmailPages.jsx/VerificationFailedPage";
import VerifyEmailPage from "./pages/VerifyEmailPages.jsx/VerifyEmailPage";

function App() {
  const {
  data: authData,
  isLoading,
  error,
  isError,
} = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    const res = await axiosInstance.get("/auth/me", { withCredentials: true });
    return res.data;
  },
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: true,   // IMPORTANT ✅
});


  console.log("📊 authData:", authData);
  console.log("🔍 isLoading:", isLoading);
  console.log("❌ isError:", isError);
  console.log("💥 error:", error);
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    );
  }

  const authUser = authData?.user;
  console.log(authData);
  return (
    <BrowserRouter>
      {" "}
      {/* Wrap with BrowserRouter */}
      <div className="h-screen" data-theme="night">
        <Routes>
          {/* Public routes (accessible without auth) */}
          <Route
            path="/signup"
            element={!authUser ? <SignUp /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />

          {/* Email verification routes (should be public) */}
          <Route
            path="/verify-instructions"
            element={<VerifyInstructionsPage />}
          />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route
            path="/verification-success"
            element={<VerificationSuccessPage />}
          />
          <Route
            path="/verification-failed"
            element={<VerificationFailedPage />}
          />

          {/* Protected routes (require auth) */}
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/onborading"
            element={authUser ? <OnBoradingPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/call"
            element={authUser ? <CallPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/notification"
            element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={authUser ? <ChatPage /> : <Navigate to="/login" />}
          />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
