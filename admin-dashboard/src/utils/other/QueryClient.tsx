import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactDOM from "react-dom";
import Router from "../../routers/Router";
import { Toaster } from "react-hot-toast";

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 0 } },
});

function QueryClientPro() {
  return (
    <QueryClientProvider client={client}>
      <Router />
      {ReactDOM.createPortal(<Toaster />, document.body)}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}


export default QueryClientPro;
