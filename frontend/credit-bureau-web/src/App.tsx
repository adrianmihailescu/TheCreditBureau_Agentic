import CreditBureauDashboard from "./pages/CreditBureauDashboard";
import { DemoWorkflowProvider } from "./features/applications/workflow/DemoWorkflowContext";

export default function App() {
  return (
    <DemoWorkflowProvider>
      <CreditBureauDashboard />
    </DemoWorkflowProvider>
  );
}
