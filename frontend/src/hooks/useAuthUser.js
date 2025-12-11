import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../api/auth.js";

export const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["user"],
    queryFn: getAuthUser,
    retry: false,
  });
  return {isLoading:authUser.isLoading,authUser:authUser.data?.user}
};
