import { useContext } from "react";
import { RequestContext } from "../contexts/RequestContext";

const useRequest: any = () => useContext(RequestContext);
export default useRequest;