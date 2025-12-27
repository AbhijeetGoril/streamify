import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getRecommededUsers,
  getUserFriends,
  getOutGoingFrindsreq,
  sendFrindRequest,
  incommingFrinedReq,
} from "../api/user";
import { CheckCheckIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import FrindCard from "../components/FrindCard";
import NoFriendsFound from "./NoFriendsFound";

import capitialize from "../components/capitialize";
import GetLangugeFlag from "../components/getLangugeFlag.jSX";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outGoingRequestIds, setOutGoingRequestIds] = useState(new Set());
  const [inCominngRequestIds, setinCominngRequestIds] = useState(new Set());

  const { data, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  const friends = data?.friends ?? [];

  const { data: recommendedUsers = [], isLoading: loadingRecommendedUsers } =
    useQuery({
      queryKey: ["recommendedUsers"],
      queryFn: getRecommededUsers,
    });

  const { data: outGoingFrindsreqs, isLoading: loadingoutGoingFrindsreq } =
    useQuery({
      queryKey: ["outGoingFrindsreq"],
      queryFn: getOutGoingFrindsreq,
    });

   const { data: inCommingFriendReq, isLoading: loadingIncomming } =
    useQuery({
      queryKey: ["inCommingFriendReq"],
      queryFn: incommingFrinedReq,
    }); 
   
  const { mutate: sendFrindMutation ,isPending} = useMutation({
    mutationFn: sendFrindRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outGoingFrindsreq"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outGoingFrindsreqs && outGoingFrindsreqs.length > 0) {
      outGoingFrindsreqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutGoingRequestIds(outgoingIds);
    }
  }, [outGoingFrindsreqs]);

  useEffect(() => {
    const incommingIds = new Set();
    if (inCommingFriendReq?.incommingRequest && inCommingFriendReq?.incommingRequest.length > 0) {
      inCommingFriendReq.incommingRequest.forEach((req) => {
        incommingIds.add(req.sender._id);
      });
      setinCominngRequestIds(incommingIds);
    }
  }, [inCommingFriendReq]);
 

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight ">
            Your Friends
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm siz">
            <UsersIcon className="mr-2 size-4" />
            Frinds-Requests
          </Link>
        </div>
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4  ">
            {friends.map((friend) => {
              return <FrindCard key={friend._id} friend={friend} />;
            })}
          </div>
        )}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchance partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>
          {loadingRecommendedUsers ? (
            <div className="flex justify-between py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendatioms avaiable
              </h3>
              <p className="text-base-content">
                Check back later for new partners
              </p>
            </div>
          ) : (
            <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outGoingRequestIds.has(user._id);
                const incomming = inCominngRequestIds.has(user._id);
                if(incomming){
                  return null
                }
                return (
                  <div
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    key={user._id}
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-2 ring-offset-base-200">
                            <img src={user.profilePic} alt={user.fullName} />
                          </div>
                        </div>
                        <div className=" min-w-0" >
                          <h3 className="font-semibold text-lg truncate">{user.fullName}</h3>
                          {user.location&&(
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1"/>
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                                <span className="badge badge-secondary text-xs ">
                                  { <GetLangugeFlag language={user.nativeLanguage} />}
                                  Navive: {capitialize(user.nativeLanguage)}
                                </span>
                                <span className="badge  badge-outline text-xs">
                                  {<GetLangugeFlag language={user.learningLanguage} />}
                                  Learing: {capitialize(user.learningLanguage)}
                                </span>
                      </div>
                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}
                      <button className={`btn w-full mt-2 ${hasRequestBeenSent ?"btn-disabled":"btn-primary"}`
                    }
                    onClick={()=>sendFrindMutation(user._id)}
                    disabled={hasRequestBeenSent|| isPending}
                    >
                      {hasRequestBeenSent?(
                        <>
                        <CheckCheckIcon className="size-4 mr-2"/>
                        Request Sent
                        </>
                      ):(
                        <>
                        
                        <UserPlusIcon className="size-4 mr-2"/>
                        Send Friend Reuest
                        </>
                      )}
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
