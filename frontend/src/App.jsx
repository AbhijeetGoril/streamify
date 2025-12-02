import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import OnBoradingPage from "./pages/OnBoradingPage";
import CallPage from "./pages/CallPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import  {Toaster} from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";
import axois from "axios"
function App() {
  const {data,isLoading,error}=useQuery({
    queryKey:["todos"],
    queryFn:async()=>{
      const res=await axois("https://jsonplaceholder.typicode.com/todos")
      const data=res.json()
      return data;
    }
  })
  console.log(data)
  return (
    <div className="  h-screen " data-theme="night">
      <Routes>
        <Route path="/" element={<HomePage/>} ></Route>
        <Route path="/signup" element={<SignUp/>} ></Route>
        <Route path="/login" element={<LoginPage/> }></Route>
        <Route path="/onborading" element={<OnBoradingPage/> }></Route>
        <Route path="/call" element={<CallPage/>}></Route>
        <Route path="/notification" element={<NotificationPage/>}></Route>
        <Route path="/chat" element={<ChatPage/>}></Route>
      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
