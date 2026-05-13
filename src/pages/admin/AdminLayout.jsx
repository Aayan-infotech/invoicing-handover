import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { useQuery } from "@tanstack/react-query";
// import { getUserProfile } from "../../services/index/users";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { logout } from "../../store/actions/user";
import Loading from "../../components/Loading/Loading";

const AdminLayout = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);

  //   useEffect(() => {
  //     if (userState.userInfo || userState.userInfo?.user?.role !== "admin") {
  //       navigate("/login");
  //     }
  //   }, [navigate, , userState.userInfo]);

  const {
    data: profileData,
    isLoading: profileIsLoading,
    error: profileError,
  } = useQuery({
    queryFn: () => {
      //   return getUserProfile({ token: userState.userInfo.token });
    },
    queryKey: ["profile"],
    onSuccess: (data) => {
      if (!data?.role || data.role !== "admin") {
        navigate("/login");
        toast.error("Your are not allowed to access admin panel");
      }
    },
    onError: (err) => {
      navigate("/login");
      toast.error("Your are not allowed to access admin panel");
    },
  });

  if (profileIsLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <h3 className="text-2xl text-slate-700">Loading...</h3>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
