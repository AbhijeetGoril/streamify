import React from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import { Link, useLocation } from 'react-router'

import { BellIcon, LogOutIcon, ShipWheelIcon } from 'lucide-react'
import ThemeSeletor from './ThemeSeletor'
import useLogout from '../hooks/useLogout'

const Navbar = () => {
  const {authUser}=useAuthUser()
  const location =useLocation();
  const isChatPage=location.pathname?.startsWith("/chat")
  // const queryClient=useQueryClient()
  // const {mutate:logoutMutation}=useMutation({
  //   mutationFn:logout,
  //   onSuccess:()=>{
  //     queryClient.invalidateQueries({queryKey:["user"]})
  //   }
  // })
  const {logoutMutation}=useLogout()
  return (
    <nav className='bs-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center '>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between w-full'>
          {isChatPage && <div className='pl-5 flex items-center gap-2.5'>
            <ShipWheelIcon className='size-9 text-primary '/>
            <span className='text-3xl font-bold font-momo bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-wider '>Streamify</span> 
            </div>}
            <div className='flex items-center'>
              <div className='flex items-center gap-3 sm:gap-4 '>
            <Link to="/notifications">
              <button className='btn btn-ghost btn-circle'>
                  <BellIcon className='h-6 w-6 text-base-content opacity-70'></BellIcon>
              </button>
            </Link>
            </div>  
            <ThemeSeletor/>
            <div className='avatar'>
              <div className='w-9 rounded-full'>
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
              </div>
            <button className='btn btn-ghost btn-circle' onClick={logoutMutation}>
              <LogOutIcon className='h-6 w-6 text-base-content opacity-70'/>
              </button>  
            </div>
          
        </div>
      </div>
    </nav>
  )
}

export default Navbar