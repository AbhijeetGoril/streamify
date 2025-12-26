import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom"; // Add this import
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import OnboardingPage from "./pages/OnBoradingPage.jsx";
import CallPage from "./pages/CallPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";

// Add these imports for verification pages
import VerifyInstructionsPage from "./pages/VerifyEmailPages.jsx/VerifyInstructionsPage";
import VerificationSuccessPage from "./pages/VerifyEmailPages.jsx/VerificationSuccessPage";
import VerificationFailedPage from "./pages/VerifyEmailPages.jsx/VerificationFailedPage";
import VerifyEmailPage from "./pages/VerifyEmailPages.jsx/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import ResetPasswordPage from "./pages/ ResetPasswordPage";
import PageLoader from "./components/PageLoader.jsx";
import { useAuthUser } from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

function App() {
  const { isLoading, authUser } = useAuthUser();
  
  const isOnboarded = authUser?.isOnboarded;
  const theme=useThemeStore((state)=>state.theme)
 
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      {" "}
      {/* Wrap with BrowserRouter */}
      <div className="h-screen" data-theme={theme}>
        <Routes>
          {/* Public routes (accessible without auth) */}
          <Route
            path="/signup"
            element={!authUser ? <SignUp /> : <Navigate to={isOnboarded?"/":"/onboarding"} />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to={isOnboarded?"/":"/onboarding"} />}
          />
          <Route
            path="/forgot-password"
            element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />}
          />
          <Route
            path="/reset-password/:token"
            element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />}
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
            element={
              authUser && isOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage/>
                </Layout>
              ) : <Navigate to={!authUser?"/login":"/onboarding"}/>
            }
          />
          <Route
            path="/homepage"
            element={
              authUser && isOnboarded ? (
                <HomePage />
              ) : <Navigate to={!authUser?"/login":"/onboarding"}/>
            }
          />
          <Route
            path="/onboarding"
            element={authUser ? (!isOnboarded ?<OnboardingPage/>:<Navigate to="/"/>) : <Navigate to="/login" />}
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
            element={authUser ? <Layout> <ChatPage /> </Layout> : <Navigate to="/login" />}
          />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
