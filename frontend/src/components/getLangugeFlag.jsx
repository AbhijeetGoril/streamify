import { LANGUAGE_TO_FLAG } from "../constants";

import React from 'react'

const getLangugeFlag = ({language}) => {
   if (!language) return null;
  const langlower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langlower];

  if (countryCode)
    return (
      <div >
        <Flag
          countryCode={countryCode || "US"}
          svg
          style={{ width: "18px", height: "18px" }}
          title={language}
        />
      </div>
    );
}

export default getLangugeFlag
