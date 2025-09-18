import { createContext, useState } from "react";

// ============================================================

export const RequestContext = createContext({
  isLoading: false,
  setLoading: (arg: any) => { },
});

// ============================================================

const RequestProvider = ({ children }: any) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <RequestContext.Provider
      value={{
        setLoading,
        isLoading,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export default RequestProvider;