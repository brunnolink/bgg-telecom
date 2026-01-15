import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./routes/PrivateRoute";
import { Tickets } from "./pages/tickets/tickets";
import { Auth } from "./pages/auth/Auth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/tickets"
          element={
            <PrivateRoute>
              <Tickets />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
