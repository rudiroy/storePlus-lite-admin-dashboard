import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createPortal } from "react-dom";
import Router from "../../routers/Router";
import { Toaster } from "react-hot-toast";

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 0 } },
});

function QueryClientPro() {
  return (
    <QueryClientProvider client={client}>
      <Router />
      {createPortal(<Toaster />, document.body)}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default QueryClientPro;