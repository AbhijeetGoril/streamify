import Flag from "react-country-flag";
import { LANGUAGE_TO_FLAG } from "../constants";

import React from 'react'

const GetLangugeFlag = ({language}) => {
   if (!language) return null;
  const langlower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langlower];

  console.log(countryCode)
    return (<div >
        <Flag
          countryCode={countryCode || "US"}
          svg
          style={{ width: "18px", height: "18px" }}
          title={language}
        />
      </div>
    );

    
}

export default GetLangugeFlag
