import { UserCheckIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  incommingFrinedReq,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api/user";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["inCommingFriendReq"],
    queryFn: incommingFrinedReq,
  });

  const incommingRequest = data?.incommingRequest ?? [];
  const acceptedRequest = data?.acceptedRequest ?? [];

  /* ================= MUTATIONS ================= */

  const { mutate: acceptMutation, isLoading: accepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inCommingFriendReq"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: rejectMutation, isLoading: rejecting } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inCommingFriendReq"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6 px-3 sm:px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Notifications
        </h1>

        {/* ================= FRIEND REQUESTS ================= */}
        <div className="flex gap-2.5 items-center mt-6 sm:mt-8">
          <UserCheckIcon className="text-primary/60" />
          <h2 className="text-lg sm:text-xl font-semibold">
            Friend Requests
          </h2>

          {incommingRequest.length > 0 && (
            <span className="px-3 rounded-xl bg-primary text-base-200 text-sm">
              {incommingRequest.length}
            </span>
          )}
        </div>

        {incommingRequest.length === 0 ? (
          <p className="mt-4 text-sm sm:text-base text-base-content/60">
            No friend requests
          </p>
        ) : (
          <div className="mt-4 space-y-3 sm:space-y-4">
            {incommingRequest.map((req) => {
              console.log(req._id)
              return <div
                key={req._id}
                className="
                  bg-base-200 p-4 rounded-2xl
                  flex flex-col gap-4
                  sm:flex-row sm:items-center sm:justify-between
                "
              >
                {/* LEFT */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={req.sender.profilePic}
                    alt={req.sender.fullName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full"
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className="
                        font-semibold truncate
                        max-w-[240px]
                        sm:max-w-[420px]
                        md:max-w-[520px]
                      "
                    >
                      {req.sender.fullName}
                    </p>
                    <p className="text-sm text-base-content/60">
                      Sent you a friend request
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => acceptMutation(req._id)}
                    disabled={accepting}
                    className="btn btn-success btn-sm flex-1 sm:flex-none"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => rejectMutation(req._id)}
                    disabled={rejecting}
                    className="btn btn-outline btn-error btn-sm flex-1 sm:flex-none"
                  >
                    Reject
                  </button>
                </div>
              </div>
            })}
          </div>
        )}

        {/* ================= ACCEPTED REQUESTS ================= */}
        {acceptedRequest.length > 0 && (
          <>
            <h2 className="text-lg sm:text-xl font-semibold mt-8 sm:mt-10">
              New Connections
            </h2>

            <div className="mt-4 space-y-3 sm:space-y-4">
              {acceptedRequest.map((req) => (
                <div
                  key={req._id}
                  className="
                    bg-base-200 p-4 rounded-2xl
                    flex flex-col gap-4
                    sm:flex-row sm:items-center sm:justify-between
                  "
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={req.recipient.profilePic}
                      alt={req.recipient.fullName}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full"
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className="
                          font-semibold truncate
                          max-w-[240px]
                          sm:max-w-[420px]
                          md:max-w-[520px]
                        "
                      >
                        {req.recipient.fullName}
                      </p>
                      <p className="text-sm text-base-content/60">
                        Accepted your friend request
                      </p>
                    </div>
                  </div>

                  <span className="badge badge-secondary w-fit">
                    New Friend
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
