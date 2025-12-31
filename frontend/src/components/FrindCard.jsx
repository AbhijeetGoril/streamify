import React from "react";
import { LANGUAGE_TO_FLAG } from "../constants";
import Flag from "react-country-flag";
import { Link } from 'react-router'

import capitialize from "./capitialize";
import GetLangugeFlag from "./getLangugeFlag";
const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:bg-base-300 transition-all duration-200 hover:shadow-lg rounded-2xl">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-2 ring-offset-base-200">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base-content truncate">
              {friend.fullName}
            </h3>
            <p className="text-sm text-base-content/60 truncate">Friend</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
          <span className="badge badge-secondary text-xs ">
            {<GetLangugeFlag language={friend.nativeLanguage} />}
            Navive: {capitialize(friend.nativeLanguage)}
          </span>
          <span className="badge  badge-outline text-xs">
            {<GetLangugeFlag language={friend.learningLanguage} />}
            Learing: {capitialize(friend.learningLanguage)}
          </span>
        </div>
        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">Message</Link>
      </div>
    </div>
  );
};

export default FriendCard;


