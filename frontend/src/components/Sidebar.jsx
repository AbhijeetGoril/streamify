import React from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      
      {/* Logo Section */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 h-full p-4 space-y-2">

        {/* Friend LINK */}
        <Link
          to="/"
          className={`
            btn btn-ghost justify-start w-full gap-3 px-4 
            rounded-full normal-case transition-all
            ${isActive("/") 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-base-300"}
          `}
        >
          <HomeIcon className="size-5 opacity-70" />
          <span className="text-sm">Home</span>
        </Link>
        <Link
          to="/friends"
          className={`
            btn btn-ghost justify-start w-full gap-3 px-4 
            rounded-full normal-case transition-all
            ${isActive("/friends") 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-base-300"}
          `}
        >
          <UsersIcon className="size-5 opacity-70" />
          <span className="text-sm">Friends</span>
        </Link>
        <Link
          to="/notifications"
          className={`
            btn btn-ghost justify-start w-full gap-3 px-4 
            rounded-full normal-case transition-all
            ${isActive("/notifications") 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-base-300"}
          `}
        >
          <BellIcon className="size-5 opacity-70" />
          <span className="text-sm">Notifications</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full"> 
                <img src={authUser?.profilePic} alt="User Avatar"/>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block "/>
                Online
              </p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
